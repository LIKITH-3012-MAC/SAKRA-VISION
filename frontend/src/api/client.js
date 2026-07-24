import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sakra-vision.onrender.com";

const SECRET_TOKEN = import.meta.env.VITE_SECRET_TOKEN || "shivayya";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Secret-Token": SECRET_TOKEN
  }
});

export const submitClientInquiry = async (payload) => {
  const response = await api.post("/api/clients", payload);
  return response.data;
};

export const sendChatMessage = async (message, history = []) => {
  const response = await api.post("/api/chat", { message, history });
  return response.data;
};
