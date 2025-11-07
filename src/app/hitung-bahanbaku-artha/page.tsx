"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import UploadCard from "@/components/UploadCard";
import { Card } from "@/components/ui/card";
import { uploadTransactions } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HitungBahanBakuArthaPage() {
  // ✅ Protect page with Firebase auth
  const { user, loading } = useAuthGuard();

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // ✅ Show spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-green-600" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  // ✅ If not logged in, user is redirected by hook
  if (!user) return null;

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadMessage(null);

    try {
      const res = await uploadTransactions(file);
      const data = res.data;

      let totalValue = 0;
      if (typeof data.total_bahan_baku_rp === "string") {
        totalValue = parseInt(data.total_bahan_baku_rp.replace(/[^\d]/g, ""), 10);
      } else {
        totalValue = data.total_bahan_baku_rp || data.total_bahan_baku || 0;
      }

      setResult({
        total_rows_processed: data.total_rows_processed,
        total_pelanggan_AG: data.total_pelanggan_AG,
        total_qty: data.total_qty,
        total_bahan_baku_rp: totalValue,
      });

      setUploadMessage("✅ File berhasil diunggah dan diproses.");
    } catch (err) {
      console.error(err);
      setUploadMessage("❌ Upload gagal. Periksa server atau file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 space-y-8">
      {/* 🔹 Back to Home */}
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>
      </div>
      <UploadCard
        title="Hitung Bahan Baku Artha"
        accentColor="green"
        onUpload={handleUpload}
        loading={uploading}
        uploadMessage={uploadMessage}
        setUploadMessage={setUploadMessage}
      />

      {result && (
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
                <strong>Total Baris Diproses:</strong>{" "}
                {result.total_rows_processed}
              </p>
              <p>
                <strong>Total Pelanggan “AG”:</strong>{" "}
                {result.total_pelanggan_AG}
              </p>
              <p>
                <strong>Total Qty:</strong> {result.total_qty}
              </p>
              <p>
                <strong>Total Bahan Baku Artha:</strong>{" "}
                <span className="text-green-600 font-semibold">
                  Rp {result.total_bahan_baku_rp.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
