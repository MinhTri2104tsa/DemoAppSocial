import axiosClient from "./axiosClient";

const authApi = {
  register: (data) => axiosClient.post("/users/register", data),
  login: (data) => axiosClient.post("/users/login", data),
};

export default authApi;
