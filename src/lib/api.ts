import axios from "axios";
import { auth } from "@/lib/firebaseClient"; // ✅ Import your initialized Firebase client

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to attach Firebase ID token if logged in
api.interceptors.request.use(async (config) => {
  // Skip if Authorization is already set (e.g., for /auth/google)
  if (!config.headers.Authorization) {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else if (process.env.NEXT_PUBLIC_API_TOKEN) {
        // fallback static token if user not logged in
        config.headers.Authorization = `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`;
      }
    } catch (error) {
      console.warn("Failed to attach Firebase token:", error);
    }
  }
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

// ✅ Upload transactions (now auto-attaches Firebase token)
export const uploadTransactions = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload-transactions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Get totals
export const getTotals = async () => {
  const res = await api.get("/totals");
  return res.data;
};

export default api;
