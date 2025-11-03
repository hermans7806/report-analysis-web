"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadCardProps {
  title: string;
  accentColor?: string;
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
  uploadMessage?: string | null;
  setUploadMessage: (msg: string | null) => void;
}

export default function UploadCard({
  title,
  accentColor = "blue",
  onUpload,
  loading,
  uploadMessage,
  setUploadMessage,
}: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }
    await onUpload(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl w-full"
    >
      <Card className={`p-6 shadow-lg border-2 border-${accentColor}-100`}>
        <CardContent className="flex flex-col items-center gap-4">
          <h1
            className={`text-2xl font-bold text-${accentColor}-700 mb-2 text-center`}
          >
            {title}
          </h1>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600"
          />

          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white px-6`}
          >
            {loading ? "Mengunggah..." : "Kirim ke Server"}
          </Button>

          {uploadMessage && (
            <p
              className={`text-sm mt-2 ${
                uploadMessage.startsWith("✅")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {uploadMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
