"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// ✅ Memastikan import service tetap sesuai path Bapak
import {
  getMateriByModule,
  createMateri,
  updateMateri,
  deleteMateri,
} from "@/app/services/materiService";

export default function MateriPage() {
  const params = useParams();
  // ✅ Ambil moduleId dengan aman dari params
  const moduleId = params?.moduleId;

  const [materi, setMateri] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    video_url: "",
    order_number: "",
  });

  const [editingId, setEditingId] = useState(null);

  // LOAD DATA
  const fetchMateri = async () => {
    try {
      // ✅ Menggunakan service (pastikan di materiService sudah pakai api.get)
      const data = await getMateriByModule(moduleId);
      setMateri(data || []);
    } catch (error) {
      console.error("Gagal load materi:", error);
    }
  };

  useEffect(() => {
    if (moduleId) fetchMateri();
  }, [moduleId]);

  // INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      module_id: moduleId,
      // Pastikan order_number dikirim sebagai angka
      order_number: parseInt(form.order_number) || 0
    };

    try {
      if (editingId) {
        await updateMateri(editingId, payload);
      } else {
        await createMateri(payload);
      }

      setForm({
        title: "",
        content: "",
        video_url: "",
        order_number: "",
      });

      setEditingId(null);
      fetchMateri();
    } catch (error) {
      alert("Gagal menyimpan materi: " + error.message);
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setForm({
        title: item.title || "",
        content: item.content || "",
        video_url: item.video_url || "",
        order_number: item.order_number || "",
    });
    setEditingId(item.id);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (confirm("Hapus materi ini?")) {
        try {
            await deleteMateri(id);
            fetchMateri();
        } catch (error) {
            alert("Gagal menghapus materi");
        }
    }
  };

  // --- UI TETAP SAMA 100% ---
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Materi Module ID: {moduleId}
      </h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          name="title"
          placeholder="Judul"
          value={form.title}
          onChange={handleChange}
          className="border p-2 w-full text-black"
        />

        <textarea
          name="content"
          placeholder="Isi materi"
          value={form.content}
          onChange={handleChange}
          className="border p-2 w-full text-black"
        />

        <input
          name="video_url"
          placeholder="YouTube URL"
          value={form.video_url}
          onChange={handleChange}
          className="border p-2 w-full text-black"
        />

        <input
          name="order_number"
          placeholder="Urutan"
          value={form.order_number}
          onChange={handleChange}
          className="border p-2 w-full text-black"
        />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Tambah"}
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-4">
        {materi.map((m) => (
          <div key={m.id} className="border p-4 rounded bg-white shadow-sm">
            <h2 className="font-bold text-black">{m.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{m.content}</p>

            {/* VIDEO */}
            {m.video_url && (
              <div className="mt-4">
                  <iframe
                    width="100%"
                    height="315"
                    src={m.video_url.includes('watch?v=') ? m.video_url.replace("watch?v=", "embed/") : m.video_url}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl"
                  ></iframe>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(m)}
                className="bg-yellow-500 text-white px-4 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(m.id)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}