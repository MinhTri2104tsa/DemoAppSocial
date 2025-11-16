import axiosClient from './axiosClient';

const userApi = {
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (formData) => axiosClient.put('/users/me', formData),
};

export default userApi;
