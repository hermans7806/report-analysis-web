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
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No Firebase user logged in — request may fail (401)");
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

// ==========================
// 📦 TIPE LAYANAN API
// ==========================
export const tipeLayananAPI = {
  getAll: async () => {
    const res = await api.get("/tipe-layanan");
    return res.data;
  },

  create: async (data: { nama_layanan: string; harga_bonus: number }) => {
    const res = await api.post("/tipe-layanan", data);
    return res.data;
  },

  update: async (id: string, data: { nama_layanan: string; harga_bonus: number }) => {
    const res = await api.put(`/tipe-layanan/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/tipe-layanan/${id}`);
    return res.data;
  },
};

export default api;
