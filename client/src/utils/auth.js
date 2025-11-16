// src/utils/auth.js
const setToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");
const removeToken = () => localStorage.removeItem("token");

const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
const getUser = () => JSON.parse(localStorage.getItem("user"));
const removeUser = () => localStorage.removeItem("user");

const isAuthenticated = () => !!getToken();

module.exports = {
  setToken,
  getToken,
  removeToken,
  setUser,
  getUser,
  removeUser,
