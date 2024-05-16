import os
import numpy as np

import nltk
from django.conf import settings
from rest_framework.exceptions import APIException
import pytesseract
import PyPDF2
import re
import cv2
import docx2txt
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

import tensorflow as tf
import pickle
from keras.preprocessing.sequence import pad_sequences

from api.models import User, File

import boto3


#DocUpload
class DocumentUploadService:
    @staticmethod
    def save_uploaded_file(file_obj, directory):
        try:
            media_root = os.path.join(settings.MEDIA_ROOT, directory)
            os.makedirs(media_root, exist_ok=True)
            file_path = os.path.join(media_root, file_obj.name)
            with open(file_path, 'wb') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
            return file_path
        except Exception as e:
            raise APIException(f"Error uploading file: {str(e)}")


#Preproccessing
class FilePreprocessingService:
    @staticmethod
    def file_preprocessing(file_path, user: User):
        extracted_text = ''
        file_extension = file_path.split('.')[-1]
        if file_extension == 'docx':
            extracted_text = FilePreprocessingService.preprocess_word(file_path)
        elif file_extension == 'pdf':
            extracted_text = FilePreprocessingService.preprocess_pdf(file_path)
        elif file_extension == 'png' or file_extension == 'jpg':
            extracted_text = FilePreprocessingService.preprocess_image(file_path)
        FileProcessingService.file_processing(file_path, extracted_text, user)

    @staticmethod
    def text_normalization(text):
        nltk.download('stopwords')
        nltk.download('punkt')

        text = text.lower()
        text = re.sub(r'\n+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s]', '', text)
        stop_words = set(stopwords.words('russian'))  # Стоп-слова для русского языка
        word_tokens = word_tokenize(text)
        filtered_text = [word for word in word_tokens if word not in stop_words]
        text = ' '.join(filtered_text)
        return text

    @staticmethod
    def preprocess_word(file_path):
        try:
            text = docx2txt.process(file_path)
            normalized_text = FilePreprocessingService.text_normalization(text)

            return normalized_text
        except Exception as e:
            print(f"Error preprocessing Word document: {str(e)}")
            return None

    @staticmethod
    def preprocess_pdf(file_path):
        try:
            text = ''
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text()
            normalized_text = FilePreprocessingService.text_normalization(text)
            return normalized_text
        except Exception as e:
            print(f"Error preprocessing PDF: {str(e)}")
            return None

    @staticmethod
    def preprocess_image(file_path):
        try:
            text = ComputerVisionService.image_to_text(file_path)
            normalized_text = FilePreprocessingService.text_normalization(text)
            return normalized_text
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}")
            return None


#Processing
class FileProcessingService:
    @staticmethod
    def file_processing(file_path, extracted_text, user: User):
        text_class = FileProcessingService.classify_text(extracted_text)
        cloud_service.upload_file(file_path, user.username + '/' + text_class + '/' + os.path.basename(file_path))
        FileService.add_file(user, os.path.basename(file_path), text_class, file_path.split('.')[-1],
                             os.path.getsize(file_path),
                             user.username + '/' + text_class + '/' + os.path.basename(file_path))
        os.remove(file_path)

    @staticmethod
    def classify_text(text):
        with open('tokenizer.pickle', 'rb') as handle:
            tokenizer = pickle.load(handle)
        loaded_model = tf.keras.models.load_model('my_model.keras')
        sequences = tokenizer.texts_to_sequences([text])
        padded_sequences = pad_sequences(sequences, maxlen=1000)
        prediction = loaded_model.predict(padded_sequences)

        predicted_class = np.argmax(prediction)
        if predicted_class == 0:
            return 'check'
        elif predicted_class == 1:
            return 'certificate'
        else:
            return 'contract'


#CompVision
class ComputerVisionService:
    @staticmethod
    def image_to_text(file_path):
        try:
            img = cv2.imread(file_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            extracted_text = ''
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                cropped_img = gray[y:y + h, x:x + w]
                text = pytesseract.image_to_string(cropped_img, lang='rus+eng', config='--psm 11')
                extracted_text += text + ' '
            return extracted_text.strip()
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return None


#Cloud
class CloudService:
    def __init__(self, access_key_id, secret_access_key, bucket_name):
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.bucket_name = bucket_name

        self.s3 = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
        )

    def upload_file(self, file_path, object_key):
        """
        Загрузка файла в Yandex Object Storage.

        :param file_path: Путь к файлу, который нужно загрузить.
        :param object_key: Ключ объекта, под которым файл будет сохранен в бакете.
        :return: True, если загрузка прошла успешно, иначе False.
        """
        try:
            # Загрузка файла в Yandex Object Storage
            self.s3.upload_file(file_path, self.bucket_name, object_key)
            return True
        except Exception as e:
            print(f"An error occurred during upload: {e}")
            return False

    def delete_file(self, object_key):
        """
        Удаление файл из Yandex Object Storage.

        :param object_key: Ключ объекта, который нужно удалить из бакета.
        :return: True, если удаление прошло успешно, иначе False.
        """
        try:
            # Удаление файла из Yandex Object Storage
            self.s3.delete_object(Bucket=self.bucket_name, Key=object_key)
            return True
        except Exception as e:
            print(f"An error occurred during deletion: {e}")
            return False

    def download_file(self, object_key):
        """
        Получение файла из Yandex Object Storage и сохранение его в директории проекта в папке "files".

        :param object_key: Ключ объекта, который нужно получить из бакета.
        :return: Путь к скачанному файлу, если получение прошло успешно, иначе None.
        """
        try:
            # Создание директории "files", если она не существует
            if not os.path.exists("files"):
                os.makedirs("files")

            # Формирование пути для сохранения файла
            local_file_path = os.path.join("files", os.path.basename(object_key))

            # Получение файла из Yandex Object Storage и сохранение его локально
            self.s3.download_file(self.bucket_name, object_key, local_file_path)

            # Проверка, существует ли файл
            if os.path.exists(local_file_path):
                # Возвращаем путь к скачанному файлу
                return local_file_path
            else:
                print(f"File {object_key} was not found after download")
                return None
        except Exception as e:
            print(f"An error occurred during download: {e}")
            return None


#DB
class FileService:
    @staticmethod
    def add_file(user, name, classification, extension, size, cloud_link):
        """
        Добавление записи файла в базу данных.

        :param user: Пользователь, загрузивший файл.
        :param name: Название файла.
        :param extension: Расширение файла.
        :param size: Размер файла в байтах.
        :param cloud_link: Ссылка на файл в облаке.
        :return: True, если запись успешно добавлена, иначе False.
        """
        try:
            # Создание нового объекта File
            new_file = File(
                user=user,
                name=name,
                classification=classification,
                extension=extension,
                size=size,
                cloud_link=cloud_link
            )
            new_file.save()  # Сохранение объекта в базе данных
            return True
        except Exception as e:
            print(f"An error occurred while adding file: {e}")
            return False

    @staticmethod
    def delete_file(file_id):
        """
        Удаление записи о файле из базы данных.

        :param file_id: Идентификатор файла, который нужно удалить.
        :return: True, если запись успешно удалена, иначе False.
        """
        try:
            # Поиск объекта File по идентификатору и его удаление
            file_to_delete = File.objects.get(pk=file_id)
            file_to_delete.delete()
            return True
        except File.DoesNotExist:
            print("File not found.")
            return False
        except Exception as e:
            print(f"An error occurred while deleting file: {e}")
            return False


cloud_service = CloudService(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.AWS_STORAGE_BUCKET_NAME)