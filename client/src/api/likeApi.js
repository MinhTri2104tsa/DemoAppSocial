import axiosClient from "./axiosClient";

const likeApi = {
  toggleLike: (postId) => axiosClient.post(`/likes`, { postId }),
  getLikes: (postId) => axiosClient.get(`/likes/${postId}`),
};

export default likeApi;
