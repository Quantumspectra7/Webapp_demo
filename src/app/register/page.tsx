"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { User, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUserAccount } = useApp();
  const [name, setName] = useState("Gurpreet Singh");
  const [contact, setContact] = useState("+91 98765 43210");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("1234");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      setIsOtpSent(true);
      return;
    }

    setUserAccount({
      id: `user-${Date.now()}`,
      name: name.trim() || "Promoter",
      contact: contact.trim(),
      isGuest: false,
      authenticated: true,
    });

    router.push("/onboarding");
  };

  const handleGuestContinue = () => {
    setUserAccount({
      id: "guest-user",
      name: "Guest Explorer",
      contact: "guest@gramvest.in",
      isGuest: true,
      authenticated: false,
    });
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col justify-between selection:bg-[#c75d3e] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#ede3d8] bg-white/70 backdrop-blur-md px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#c75d3e] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            GV
          </div>
          <span className="font-serif text-[20px] font-bold tracking-tight text-[#241b16]">
            GramVest
          </span>
        </Link>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="text-xs font-bold text-[#786d65] hover:text-[#1d1b18] px-3 py-1.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] transition-all cursor-pointer"
        >
          Continue as Guest
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center w-full">
        {/* Welcome Text per Section 3 */}
        <div className="w-12 h-12 rounded-2xl bg-[#c75d3e]/10 text-[#c75d3e] font-bold text-lg flex items-center justify-center mb-4">
          GV
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16] tracking-tight">
          Welcome to GramVest
        </h1>
        <p className="text-sm text-[#786d65] mt-2 mb-8 leading-relaxed max-w-sm">
          Understand your local business opportunity before you invest your money.
        </p>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 sm:p-8 w-full shadow-md text-left">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full rounded-xl border border-[#ede3d8] pl-9 pr-3 py-2.5 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#ede3d8] pl-9 pr-3 py-2.5 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              </div>
            </div>

            {isOtpSent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
                  Enter 4-Digit Verification Code (Demo: 1234)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="w-full rounded-xl border border-[#ede3d8] px-3 py-2.5 text-center text-base font-mono tracking-widest text-[#241b16] font-bold focus:border-[#c75d3e] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isOtpSent ? "Verify & Start Analysis" : "Start Analysis"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Options */}
          <div className="mt-6 pt-5 border-t border-[#ede3d8] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="font-bold text-[#786d65] hover:text-[#241b16] cursor-pointer"
            >
              Continue as Guest
            </button>
            <Link href="/get-started" className="font-bold text-[#c75d3e] hover:underline">
              How it works
            </Link>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-8 flex items-center gap-2 text-xs text-[#786d65]">
          <ShieldCheck size={16} className="text-[#3a6b4c]" />
          <span>No PAN, Aadhaar or banking credentials requested</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ede3d8] bg-white/40 py-4 px-6 text-center text-xs text-[#786d65]">
        <p>GramVest · Hyper-Local Business Advisory for Rural & Small-Town Punjab</p>
      </footer>
    </div>
  );
}
