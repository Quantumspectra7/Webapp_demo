"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#c75d3e] border-t-transparent animate-spin" />
    </div>
  );
}

