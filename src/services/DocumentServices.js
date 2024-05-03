import axios from 'axios';


const baseURL = 'http://127.0.0.1:8000/api/';


const axiosInstance = axios.create({
  baseURL,
});

export const uploadDocumentToServer = async (formData, authTokens) => {
    try {
      const response = await axiosInstance.post('uploadDocument/', formData, {
        headers: {
            'Authorization': `Bearer ${authTokens?.access}`,
            'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const getUserDocuments = async (authTokens) => {
  try {
    const response = await axiosInstance.get('getUserDocuments/', {
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    });
  
    if (response.status !== 200) {
      throw new Error('Ошибка загрузки списка файлов');
    }
  
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке списка файлов:', error);
    return null;
  }
};

export const deleteDocumentFromServer = async (documentId, authTokens) => {
  try {
    const response = await axiosInstance.delete(`deleteDocument/${documentId}/`, {
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadDocument = async (fileId, fileName, authTokens) => {
  try {
    const response = await axiosInstance.get(`downloadDocument/${fileId}/`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`, 
      },
    });

    console.log('Response status:', response.status);

    if (response.status !== 200) {
      throw new Error('Ошибка загрузки файла');
    }

    // Получаем данные о файле
    const blob = new Blob([response.data]);

    // Создаем URL для файла
    const url = window.URL.createObjectURL(blob);

    // Создаем ссылку для скачивания файла
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Устанавливаем имя файла
    document.body.appendChild(link);
    
    // Симулируем клик по ссылке для начала загрузки файла
    link.click();

    // Удаляем ссылку из DOM
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
  }
};
