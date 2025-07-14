import axios from "axios";

const API_BASE = "http://localhost:8000"; // Change if needed

export const fetchTokenData = async (text) => {
  const response = await axios.post(`${API_BASE}/tokenize`, { text });
  return response.data;
};
