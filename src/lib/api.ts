import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`;
  return config;
});

// ✅ Upload file for pendapatan
export const uploadPendapatan = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Upload transactions
export const uploadTransactions = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload-transactions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Get totals from backend
export const getTotals = async () => {
  const res = await api.get("/totals");
  return res.data;
};
