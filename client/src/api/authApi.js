const axiosClient = require("./axiosClient");

const authApi = {
  register: (data) => axiosClient.post("/users/register", data),
  login: (data) => axiosClient.post("/users/login", data),
};

module.exports = authApi;