"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishAuth = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        setError("Google sign-in did not return an authorization code.");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }
      router.replace("/onboarding");
    };

    void finishAuth();
  }, [router]);

  if (error) {
    return <main className="flex min-h-screen items-center justify-center bg-[#fff8f2] p-6 text-sm text-red-600">{error}</main>;
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#fff8f2] p-6 text-sm text-[#786d65]">Completing sign in...</main>;
}