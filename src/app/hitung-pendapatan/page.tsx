"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import UploadCard from "@/components/UploadCard";
import { Card } from "@/components/ui/card";
import { uploadPendapatan, getTotals } from "@/lib/api";

export default function HitungPendapatanPage() {
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [totals, setTotals] = useState<any>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setUploadMessage(null);

    try {
      // Upload file to backend
      await uploadPendapatan(file);
      setUploadMessage("✅ File berhasil diunggah dan disimpan ke Firebase.");

      // Fetch totals from backend
      const totalsData = await getTotals();
      setTotals(totalsData);
    } catch (err) {
      console.error(err);
      setUploadMessage("❌ Upload gagal. Periksa server atau file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 space-y-8">
      {/* ✅ Reusable UploadCard */}
      <UploadCard
        title="Hitung Pendapatan Laundry"
        accentColor="blue"
        onUpload={handleUpload}
        loading={loading}
        uploadMessage={uploadMessage}
        setUploadMessage={setUploadMessage}
      />

      {/* ✅ Results Section */}
      {totals && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-xl"
        >
          <Card className="p-6 shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📊 Hasil Perhitungan
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Total Pendapatan Artha:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  Rp {totals.pendapatan_artha.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                <strong>Total Pendapatan Pusat:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  Rp {totals.pendapatan_pusat.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                <strong>Total Semua:</strong>{" "}
                <span className="text-blue-700 font-bold">
                  Rp {totals.total_all.toLocaleString("id-ID")}
                </span>
              </p>

              <hr className="my-3" />

              <h3 className="font-semibold">💼 Per Cashbox:</h3>
              <ul className="list-disc pl-5 text-sm">
                {Object.entries(totals.totals_by_cashbox || {}).map(
                  ([cashbox, total]) => (
                    <li key={cashbox}>
                      {cashbox}: Rp{" "}
                      {(total as number).toLocaleString("id-ID")}
                    </li>
                  )
                )}
              </ul>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
