import { api } from "@/lib/api";

// 1. GET ALL COURSES (Dibutuhkan Dashboard Student agar Build Sukses)
export const getCourses = async () => {
  try {
    const res = await api.get("/api/teacher/courses");
    // Axios otomatis parsing JSON ke res.data
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("Error getCourses:", error.message);
    return [];
  }
};

// 2. GET FULL COURSES (Untuk Daftar Course Guru - Nested Data)
export const getFullCourses = async () => {
  try {
    // Menembak endpoint yang mengembalikan data lengkap (Join sesuai ERD)
    const res = await api.get("/api/teacher/courses");
    const result = res.data?.data || res.data;
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error getFullCourses:", error.message);
    return [];
  }
};

// 3. CREATE COURSE
export const createCourse = async (data) => {
  const res = await api.post("/api/teacher/courses", data);
  return res.data;
};

// 4. UPDATE COURSE
export const updateCourse = async (id, data) => {
  const res = await api.put(`/api/teacher/courses/${id}`, data);
  return res.data;
};

// 5. UPDATE MODULE
export const updateModule = async (id, data) => {
  const res = await api.put(`/api/teacher/modules/${id}`, data);
  return res.data;
};

// 6. UPDATE MATERI
export const updateMateri = async (id, data) => {
  const res = await api.put(`/api/teacher/materi/${id}`, data);
  return res.data;
};

// 7. DELETE COURSE (Hapus Total)
export const deleteCourse = async (id) => {
  const res = await api.delete(`/api/teacher/courses/${id}`);
  return res.data;
};

// 8. GET AVAILABLE COURSES (Untuk Pretest/Posttest)
export const getAvailableCourses = async (type) => {
  try {
    const res = await api.get(`/api/courses/available-for-test?type=${type}`);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("Error getAvailableCourses:", error.message);
    return [];
  }
};