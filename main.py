import nltk
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
import pickle

import pytesseract
import cv2
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

import docx2txt

from keras.preprocessing.sequence import pad_sequences

from tensorflow.keras.layers import Embedding, Conv1D, GlobalMaxPooling1D, Dense, Dropout
from sklearn.model_selection import train_test_split
from sklearn.utils import class_weight
from tensorflow.keras import Sequential


nltk.download('stopwords')
nltk.download('punkt')

tokenizer = tf.keras.preprocessing.text.Tokenizer()


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


def text_normalization(text):
    text = text.lower()
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    stop_words = set(stopwords.words('russian'))  # Стоп-слова для русского языка
    word_tokens = word_tokenize(text)
    filtered_text = [word for word in word_tokens if word not in stop_words]
    text = ' '.join(filtered_text)
    return text


def preprocess_word(file_path):
    try:
        text = docx2txt.process(file_path)
        return text
    except Exception as e:
        print(f"Error preprocessing Word document: {str(e)}")
        return None


def train_model():
    # Подготовка данных
    data = pd.read_csv('train.csv', quotechar='"')
    X = data['Text']
    y = data['Class']

    # Преобразование строковых меток в числовые
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y)

    # Токенизация текста и преобразование в последовательности
    tokenizer.fit_on_texts(X)
    X = tokenizer.texts_to_sequences(X)
    X = pad_sequences(X, maxlen=1000)

    # Балансировка классов
    class_weights = class_weight.compute_class_weight(class_weight='balanced', classes=np.unique(y), y=y)

    # Построение модели
    model = Sequential([
        Embedding(input_dim=len(tokenizer.word_index) + 1, output_dim=100, input_length=1000),
        Conv1D(128, 5, activation='relu'),
        GlobalMaxPooling1D(),
        Dense(64, activation='relu'),
        Dropout(0.5),
        Dense(3, activation='softmax')
    ])

    # Компиляция модели
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    # Обучение модели
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train, batch_size=32, epochs=20, validation_data=(X_test, y_test), class_weight=dict(enumerate(class_weights)))

    # Оценка модели
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f'Loss: {loss}, Accuracy: {accuracy}')

    with open('tokenizer.pickle', 'wb') as handle:
        pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
    model.save('my_model.keras')


def test_model(model_path, tokenizer, text):
    # Загрузка модели
    loaded_model = tf.keras.models.load_model(model_path)

    sequences = tokenizer.texts_to_sequences([text])
    padded_sequences = pad_sequences(sequences, maxlen=1000)

    # Предсказание класса
    prediction = loaded_model.predict(padded_sequences)

    # Вывод результата
    predicted_class = np.argmax(prediction)
    if predicted_class == 0:
        print("Predicted class: Class 1")
    elif predicted_class == 1:
        print("Predicted class: Class 2")
    else:
        print("Predicted class: Class 3")


if __name__ == "__main__":
    """
    train.csv заполнял вручную:
    1. из изображений извлекал текст с помощью image_to_text
    2. нормализировал его с помощью text_normalization
    3. добавлял полученный текст в train.csv и указывал его класс
    """
    #train_model()
    with open('tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)

    model_path = 'my_model.keras'

    text_to_test = image_to_text('datasets/test/1.png')
    text_to_test = text_normalization(text_to_test)
    test_model(model_path, tokenizer, text_to_test)

    text_to_test = image_to_text('datasets/test/2.jpg')
    text_to_test = text_normalization(text_to_test)
    test_model(model_path, tokenizer, text_to_test)

    text_to_test = preprocess_word('datasets/test/3.docx')
    text_to_test = text_normalization(text_to_test)
    test_model(model_path, tokenizer, text_to_test)

    text_to_test = image_to_text('datasets/test/4.jpg')
    text_to_test = text_normalization(text_to_test)
    test_model(model_path, tokenizer, text_to_test)

    text_to_test = preprocess_word('datasets/test/5.docx')
    text_to_test = text_normalization(text_to_test)
    test_model(model_path, tokenizer, text_to_test)


