import axios from "axios";

const API_BASE = "http://localhost:8000"; // Change if needed

/**
 * API client for communicating with the FastAPI backend
 * 
 * Provides functions to fetch various types of data from the GPT-2 model:
 * - Tokenization data (tokens and input IDs)
 * - Embedding vectors for visualization
 * - Attention weights between tokens
 * - Next token predictions with probabilities
 */

/**
 * Fetch tokenization data for input text
 * @param {string} text - Input text to tokenize
 * @returns {Promise<Object>} Tokenization data with tokens and input_ids
 */
export const fetchTokenData = async (text) => {
  const response = await axios.post(`${API_BASE}/tokenize`, { text });
  return response.data;
};

/**
 * Fetch embedding vectors for input text
 * @param {string} text - Input text to get embeddings for
 * @returns {Promise<Object>} Hidden states and 3D embeddings data
 */
export const fetchEmbeddings = async (text) => {
  const response = await axios.post(`${API_BASE}/embeddings_all`, { text });
  return response.data;
};

/**
 * Fetch attention weights for input text
 * @param {string} text - Input text to analyze attention for
 * @returns {Promise<Object>} Attention matrices for all layers and heads
 */
export const fetchAttention = async (text) => {
  const response = await axios.post(`${API_BASE}/attention`, { text });
  return response.data;
};

/**
 * Fetch next token prediction for input text
 * @param {string} text - Input text to predict next token for
 * @returns {Promise<Object|null>} Next token prediction with probabilities, or null if failed
 */
export const fetchNextToken = async (text) => {
  try {
    const response = await axios.post(`${API_BASE}/next_token`, { text });
    return response.data;
  } catch (e) {
    return null;
  }
};
