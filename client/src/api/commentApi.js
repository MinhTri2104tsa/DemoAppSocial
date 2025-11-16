const axiosClient = require("./axiosClient");


const commentApi = {
  getComments: (postId) => axiosClient.get(`/comments/${postId}`),
  addComment: (data) => axiosClient.post(`/comments`, data),
  updateComment: (id, data) => axiosClient.put(`/comments/${id}`, data),
  deleteComment: (id, data) => axiosClient.delete(`/comments/${id}`, { data }),
};
module.exports = commentApi;