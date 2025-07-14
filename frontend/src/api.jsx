import axios from "axios";

const API_BASE = "http://localhost:8000"; // Change if needed


export const fetchTokenData = async (text) => {
  const response = await axios.post(`${API_BASE}/tokenize`, { text });
  return response.data;
};

export const fetchEmbeddings = async (text) => {
  const response = await axios.post(`${API_BASE}/embeddings`, { text });
  return response.data;
};

export const fetchAttention = async (text) => {
  const response = await axios.post(`${API_BASE}/attention`, { text });
  return response.data;
};

// If you have a next token prediction endpoint, add it here
export const fetchNextToken = async (text) => {
  try {
    const response = await axios.post(`${API_BASE}/next_token`, { text });
    return response.data;
  } catch (e) {
    return null;
  }
};
