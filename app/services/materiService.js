import { api } from "@/lib/api";

// 1. GET MATERI BY MODULE
export const getMateriByModule = async (moduleId) => {
  try {
    // ✅ PERBAIKAN: Menggunakan api.get dengan prefix /api
    const res = await api.get(`/api/teacher/materi/module/${moduleId}`);
    
    // Axios otomatis memparsing JSON ke dalam properti .data
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("Error getMateriByModule:", error.message);
    return [];
  }
};

// 2. CREATE MATERI
export const createMateri = async (data) => {
  try {
    // ✅ PERBAIKAN: Menggunakan api.post (Otomatis membawa cookie auth)
    const res = await api.post("/api/teacher/materi", data);
    return res.data;
  } catch (error) {
    console.error("Error createMateri:", error.message);
    throw error;
  }
};

// 3. UPDATE MATERI
export const updateMateri = async (id, data) => {
  try {
    // ✅ PERBAIKAN: Sinkronisasi rute PUT
    const res = await api.put(`/api/teacher/materi/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updateMateri:", error.message);
    throw error;
  }
};

// 4. DELETE MATERI
export const deleteMateri = async (id) => {
  try {
    // ✅ PERBAIKAN: Menggunakan api.delete
    const res = await api.delete(`/api/teacher/materi/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleteMateri:", error.message);
    throw error;
  }
};