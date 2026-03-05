"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createInvoice, invoiceCustomerAPI } from "@/lib/api";

type InvoiceCustomer = {
  id: string;
  customer_name: string;
  shown_name: string;
  created_at: string;
};

export default function CreateInvoiceNeedwashPage() {
  const { user, loading } = useAuthGuard();

  const [file, setFile] = useState<File | null>(null);
  const [customers, setCustomers] = useState<InvoiceCustomer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ==========================
  // Fetch Invoice Customers
  // ==========================
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const data = await invoiceCustomerAPI.getAll();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed fetching customers", err);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (user) {
      fetchCustomers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-indigo-600" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) return null;

  const handleCreateInvoice = async () => {
    const selectedCustomer = customers.find(c => c.id === selectedId);

    if (!file || !selectedCustomer) {
      setMessage("❌ File dan Nama Pelanggan wajib dipilih.");
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const response = await createInvoice(
        file,
        selectedCustomer.customer_name,
        selectedCustomer.shown_name
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "invoice-needwash.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("✅ Invoice berhasil dibuat & diunduh.");
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal membuat invoice. Periksa server.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 space-y-8">
      
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="p-8 shadow-lg border-2 border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
            🧾 Create Invoice Needwash
          </h2>

          <div className="space-y-5">

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload File XLSX
              </label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            {/* Customer Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Pelanggan
              </label>

              {loadingCustomers ? (
                <div className="flex items-center text-sm">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Loading customers...
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.shown_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Button */}
            <Button
              onClick={handleCreateInvoice}
              disabled={creating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-semibold"
            >
              {creating ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Membuat Invoice...
                </>
              ) : (
                "🚀 Create Invoice"
              )}
            </Button>

            {message && (
              <p className="text-center text-sm text-gray-600">{message}</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}