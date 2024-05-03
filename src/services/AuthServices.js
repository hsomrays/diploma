import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api/';

const axiosInstance = axios.create({
  baseURL,
});

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('token/', {
      email,
      password,
    });
    return { success: true, data: response.data, error: null };
  } catch (error) {
    return { success: false, data: null, error: error.response.data || error.message };
  }
};

export const registerUser = async (email, username, password, password2) => {
  try {
    await axiosInstance.post('register/', {
      email,
      username,
      password,
      password2,
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.response.data || error.message };
  }
};

export default axiosInstance;
