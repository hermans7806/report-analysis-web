"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Upload,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface BonusItem {
  nama_layanan: string;
  cuci: number;
  bonus: number;
}

export default function HitungBonusPage() {
  const { user, loading: authLoading } = useAuthGuard();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bonusData, setBonusData] = useState<Record<string, BonusItem[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingData, setLoadingData] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file Excel terlebih dahulu (.xlsx)");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload-bonus", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchBonusList();
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file bonus.");
    } finally {
      setUploading(false);
    }
  };

  const fetchBonusList = async () => {
    setLoadingData(true);
    try {
      const res = await api.get("/bonus-list");
      setBonusData(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data bonus.");
    } finally {
      setLoadingData(false);
    }
  };

  const toggleExpand = (nama: string) => {
    setExpanded((prev) => ({ ...prev, [nama]: !prev[nama] }));
  };

  const calculateTotalBonus = (items: BonusItem[]) =>
    items.reduce((acc, curr) => acc + (curr.bonus || 0), 0);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-6 shadow-md border bg-white">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📊 Hitung Bonus Staff
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="border rounded-md px-3 py-2 w-full sm:w-auto"
            />
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Proses
                </>
              )}
            </Button>
          </div>

          <hr className="my-4" />

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
              <span>Memuat data bonus...</span>
            </div>
          ) : Object.keys(bonusData).length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              Belum ada data bonus. Upload file untuk memulai.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(bonusData).map(([nama, items]) => {
                const totalBonus = calculateTotalBonus(items);
                return (
                  <div
                    key={nama}
                    className="border rounded-lg bg-white shadow-sm overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(nama)}
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          👤 {nama}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-green-600" />
                          Total Bonus:{" "}
                          <span className="font-semibold text-green-700">
                            Rp {totalBonus.toLocaleString("id-ID")}
                          </span>
                        </p>
                      </div>
                      {expanded[nama] ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    {expanded[nama] && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-700 border-t">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="text-left px-4 py-2">Nama Layanan</th>
                              <th className="text-center px-4 py-2">Cuci</th>
                              <th className="text-right px-4 py-2">Bonus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr
                                key={idx}
                                className={`${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } border-b`}
                              >
                                <td className="px-4 py-2">{item.nama_layanan}</td>
                                <td className="text-center px-4 py-2">{item.cuci}</td>
                                <td className="text-right px-4 py-2">
                                  Rp {item.bonus.toLocaleString("id-ID")}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-green-50 font-semibold border-t">
                              <td className="px-4 py-2 text-right" colSpan={2}>
                                Total:
                              </td>
                              <td className="px-4 py-2 text-right text-green-700">
                                Rp {totalBonus.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
