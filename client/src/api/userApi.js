const axiosClient = require('./axiosClient');

const userApi = {
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (formData) => axiosClient.put('/users/me', formData),
};

module.exports = userApi;