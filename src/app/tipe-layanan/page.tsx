"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { tipeLayananAPI } from "@/lib/api";

interface TipeLayanan {
  id?: string;
  nama_layanan: string;
  harga_bonus: number;
}

export default function TipeLayananPage() {
  const { user, loading: authLoading } = useAuthGuard();

  const [namaLayanan, setNamaLayanan] = useState("");
  const [hargaBonus, setHargaBonus] = useState("");
  const [layananList, setLayananList] = useState<TipeLayanan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchLayanan = async () => {
    try {
      const data = await tipeLayananAPI.getAll();
      setLayananList(data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchLayanan();
  }, [user]);

  const handleSubmit = async () => {
    if (!namaLayanan || !hargaBonus) return alert("Isi semua field terlebih dahulu.");
    setLoading(true);
    try {
      const payload = { nama_layanan: namaLayanan, harga_bonus: Number(hargaBonus) };

      if (editingId) {
        await tipeLayananAPI.update(editingId, payload);
      } else {
        await tipeLayananAPI.create(payload);
      }

      setEditingId(null);
      setNamaLayanan("");
      setHargaBonus("");
      fetchLayanan();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: TipeLayanan) => {
    setEditingId(item.id!);
    setNamaLayanan(item.nama_layanan);
    setHargaBonus(String(item.harga_bonus));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus tipe layanan ini?")) return;
    try {
      await tipeLayananAPI.remove(id);
      fetchLayanan();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
    }
  };

  // 🌀 Show loader while checking auth or fetching
  if (authLoading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
        <span>Memuat data dan memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* 🔹 Back to Home */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="p-6 shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            ⚙️ Input Tipe Layanan & Harga Bonus
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Nama Layanan"
              value={namaLayanan}
              onChange={(e) => setNamaLayanan(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Harga Bonus (Rp)"
              value={hargaBonus}
              onChange={(e) => setHargaBonus(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {editingId ? "💾 Simpan" : "➕ Tambah"}
            </Button>
          </div>

          <hr className="my-4" />

          <div className="space-y-2">
            {layananList.length === 0 && (
              <p className="text-gray-500 text-sm">Belum ada data layanan.</p>
            )}
            {layananList.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border rounded-lg p-3 bg-white shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.nama_layanan}</p>
                  <p className="text-sm text-gray-600">
                    Bonus: Rp {Number(item.harga_bonus).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    ✏️ Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id!)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
