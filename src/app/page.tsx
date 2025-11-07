"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuthGuard();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" />
        <span>Memeriksa sesi login...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="p-6 shadow-lg border-2 border-blue-100 text-center">
          <CardContent className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-bold text-blue-700">
              Selamat Datang, {user.displayName || "User"} 👋
            </h1>

            <p className="text-gray-600 mb-2">
              Pilih perhitungan yang ingin Anda lakukan:
            </p>

            <div className="flex flex-col gap-4 w-full">
              {/* 🔹 New Hitung Bonus button */}
              <Link href="/hitung-bonus" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold">
                  📊 Hitung Bonus
                </Button>
              </Link>

              <Link href="/hitung-pendapatan" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold">
                  💰 Hitung Pendapatan Laundry
                </Button>
              </Link>

              <Link href="/hitung-bahanbaku-artha" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold">
                  🧾 Hitung Bahan Baku Artha
                </Button>
              </Link>
            </div>

            {/* Separator */}
            <div className="w-full border-t border-gray-200 my-4"></div>

            {/* Section for other features */}
            <div className="flex flex-col gap-4 w-full">
              <Link href="/tipe-layanan" className="w-full">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold">
                  ⚙️ Tipe Layanan
                </Button>
              </Link>
            </div>

            <div className="w-full border-t border-gray-200 my-4"></div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                Anda login sebagai <strong>{user.email}</strong>
              </p>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-100"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Keluar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
