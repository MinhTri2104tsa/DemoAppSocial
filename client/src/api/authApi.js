import axiosClient from "./axiosClient";

const authApi = {
  register: (data) => axiosClient.post("/users/register", data),
  login: (data) => axiosClient.post("/users/login", data),
  checkEmail: (email) => axiosClient.get(`/users/check-email?email=${encodeURIComponent(email)}`),
};

export default authApi;
