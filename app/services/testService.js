import { api } from "@/lib/api";

export const uploadDocx = async (formData) => {
  // ✅ Gunakan await dan return res.data agar data 'questions' bisa dibaca
  const res = await api.post("/api/tests/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data; 
};

export const createTest = async (data) => {
  const res = await api.post("/api/tests", data);
  return res.data;
};