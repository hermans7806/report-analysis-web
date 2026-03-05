"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { invoiceCustomerAPI } from "@/lib/api";

type InvoiceCustomer = {
  id: string;
  customer_name: string;
  shown_name: string;
  created_at: string;
};

export default function AddInvoiceCustomerPage() {
  const { user, loading } = useAuthGuard();

  const [customerName, setCustomerName] = useState("");
  const [shownName, setShownName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<InvoiceCustomer[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ==========================
  // Fetch Existing Customers
  // ==========================
  const fetchCustomers = async () => {
    try {
        setLoadingData(true);
        const data = await invoiceCustomerAPI.getAll();

        // 🔥 ensure always array
        setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Failed fetching customers", err);
        setCustomers([]); // fallback
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-pink-600" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) return null;

  // ==========================
  // Submit Handler
  // ==========================
  const handleSubmit = async () => {
    if (!customerName || !shownName) {
      setMessage("❌ Semua field wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      await invoiceCustomerAPI.create({
        customer_name: customerName,
        shown_name: shownName,
      });

      setMessage("✅ Customer berhasil ditambahkan.");
      setCustomerName("");
      setShownName("");
      fetchCustomers(); // 🔥 refresh list
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal menambahkan customer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // Delete Handler
  // ==========================
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin mau hapus customer ini?")) return;

    try {
      await invoiceCustomerAPI.remove(id);
      fetchCustomers(); // 🔥 refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-10 space-y-8">
      
      {/* 🔹 Back */}
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Beranda
      </Link>

      {/* ==========================
          FORM CARD
      ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xl"
      >
        <Card className="p-6 shadow-md border">
          <h2 className="text-2xl font-bold mb-6 text-center text-pink-700">
            🧾 Add Invoice Customer
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
              placeholder="Customer Name (database)"
            />

            <input
              type="text"
              value={shownName}
              onChange={(e) => setShownName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
              placeholder="Name Shown in Invoice"
            />

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Submit"
              )}
            </Button>

            {message && (
              <p className="text-center text-sm">{message}</p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ==========================
          LIST SECTION
      ========================== */}
      <div className="w-full max-w-xl">
        <Card className="p-6 shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            📋 Existing Invoice Customers
          </h3>

          {loadingData ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              Loading...
            </div>
          ) : !customers || customers.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada data.
            </p>
          ) : (
            <div className="space-y-3">
              {customers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.shown_name}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}