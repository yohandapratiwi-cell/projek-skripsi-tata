"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    school_level: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Ganti bagian handleSubmit Bapak dengan ini untuk debugging yang lebih baik
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validasi sederhana sebelum fetch
  if (!form.school_level) {
    setMessage("Please select your school level");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    // GANTI fetch lama dengan axios (api) yang sudah kita buat
    const res = await api.post("/api/auth/register", form);

    // Axios otomatis mengubah ke JSON, jadi kita ambil dari res.data
    setMessage("Register berhasil! Redirecting...");
    setTimeout(() => {
      router.push("/login");
    }, 1500);

  } catch (err) {
    console.error("Frontend Axios Error:", err);
    // Mengambil pesan error dari backend jika ada (misal: Email sudah terdaftar)
    const errorMsg = err.response?.data?.error || "Server error: Check if backend is running";
    setMessage(errorMsg);
  } finally {
    setLoading(false);
  }
  };

  return (
        <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden pt-2">
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-50 justify-between items-center px-10 py-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
          <Link href="/">
            <h1 className="text-2xl font-black text-blue-400 cursor-pointer italic tracking-tighter uppercase">
              Semantic Wave
            </h1>
          </Link>
        </nav>

        {/* REGISTER CARD */}
        <div className="flex items-center justify-center px-6 py-20">
          <div className="bg-slate-900/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-800">
            <h2 className="text-3xl font-bold text-center mb-2">
              Create Account
            </h2>
            <p className="text-slate-400 text-center mb-8">
              Start your programming learning journey
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              />

              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              />


              {/* SCHOOL LEVEL */}
              <select
                name="school_level"
                value={form.school_level}
                onChange={handleChange}
                required
                className="w-full p-3 mb-6 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select School</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>


              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            {/* MESSAGE */}
            {message && (
              <p className="text-center mt-4 text-slate-300">
                {message}
              </p>
            )}

            {/* LOGIN LINK */}
            <p className="text-center text-slate-400 mt-6">
              Already have an account? Login{" "}
              <Link href="/login" className="text-blue-400 hover:underline">
                here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}