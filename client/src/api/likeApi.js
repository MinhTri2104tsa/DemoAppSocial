const axiosClient = require("./axiosClient");

const likeApi = {
  toggleLike: (postId) => axiosClient.post(`/likes`, { postId }),
  getLikes: (postId) => axiosClient.get(`/likes/${postId}`),
};
module.exports = likeApi;