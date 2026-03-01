import axios from "./axiosConfig";

export const toggleBookmark = (documentId) => {
  return axios.post(`/documents/${documentId}/bookmark`);
};

export const getMyBookmarks = (page = 1, limit = 10) => {
  return axios.get(`/documents/bookmarks?page=${page}&limit=${limit}`);
};