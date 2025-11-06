"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, provider, signInWithPopup } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Auto redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        localStorage.setItem("firebase_token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: currentUser.displayName,
            email: currentUser.email,
            picture: currentUser.photoURL,
          })
        );
        router.replace("/"); // ✅ Go directly to homepage
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 🚀 Manual Google login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send token to backend for verification
      const res = await api.post(
        "/auth/google",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("firebase_token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      router.replace("/");
    } catch (err: any) {
      console.error(err);
      setError("Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 shadow-lg border-2 border-blue-100 max-w-md">
          <CardContent className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">
              Login ke Dashboard
            </h1>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-6"
            >
              {loading ? "Memproses..." : "Login dengan Google"}
            </Button>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
