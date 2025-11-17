import axiosClient from "./axiosClient";

const postApi = {
  getPosts: () => axiosClient.get("/posts"),

  getUserPosts: (userId) => axiosClient.get(`/posts/user/${userId}`),

  createPost: (data) => axiosClient.post("/posts/create", data),
  
  getById: (id) => axiosClient.get(`/posts/${id}`),
  
  updatePost: (id, data) => axiosClient.put(`/posts/${id}`, data),
  
  deletePost: (id) => axiosClient.delete(`/posts/${id}`),
};

export default postApi;
