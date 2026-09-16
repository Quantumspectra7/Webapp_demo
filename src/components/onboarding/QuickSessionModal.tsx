"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { UserAccount } from "@/domain";
import { User, Phone, Mail, ArrowRight, ShieldCheck, X, Check } from "lucide-react";

interface QuickSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const QuickSessionModal: React.FC<QuickSessionModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const { userAccount, setUserAccount } = useApp();
  const [mode, setMode] = useState<"guest" | "signin" | "signup">("guest");
  const [name, setName] = useState(userAccount?.name || "Gurpreet Singh");
  const [contact, setContact] = useState(userAccount?.contact || "+91 98765 43210");
  const [otp, setOtp] = useState("1234");
  const [showOtpField, setShowOtpField] = useState(false);

  if (!isOpen) return null;

  const handleGuestContinue = () => {
    setUserAccount({
      id: "guest-explorer",
      name: "Guest Explorer",
      contact: "guest@gramvest.in",
      isGuest: true,
      authenticated: false,
    });
    onContinue();
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtpField) {
      setShowOtpField(true);
      return;
    }
    setUserAccount({
      id: `user-${Date.now()}`,
      name: name.trim() || "Promoter",
      contact: contact.trim(),
      isGuest: false,
      authenticated: true,
    });
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-[#786d65] hover:text-[#1d1b18] rounded-full hover:bg-[#faf4ee]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center mb-2">
          <Image
            src="/gramvest_logo3.png"
            alt="GramVest"
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
          />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16] mt-2">
          {mode === "guest" ? "Start Your Business Analysis" : "Sign In to GramVest"}
        </h3>
        <p className="text-xs text-[#786d65] mt-1 mb-5 leading-relaxed">
          Understand your local business feasibility before you commit your capital.
        </p>

        {mode === "guest" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] text-xs text-[#786d65] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#241b16]">
                <ShieldCheck size={16} className="text-[#3a6b4c]" />
                <span>Zero documentation barrier</span>
              </div>
              <p>
                No Aadhaar, PAN, or bank credentials are required to run market and feasibility
                assessments.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue as Guest</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#786d65]">Want to save your analysis later?</span>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-bold text-[#c75d3e] hover:underline cursor-pointer"
              >
                Sign in with Phone
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full rounded-xl border border-[#ede3d8] pl-9 pr-3 py-2 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#ede3d8] pl-9 pr-3 py-2 text-sm text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              </div>
            </div>

            {showOtpField && (
              <div>
                <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1">
                  Enter 4-Digit OTP (Demo: 1234)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="w-full rounded-xl border border-[#ede3d8] px-3 py-2 text-sm font-mono tracking-widest text-center text-[#241b16] font-bold focus:border-[#c75d3e] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{showOtpField ? "Verify & Continue" : "Send Quick OTP"}</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setMode("guest")}
                className="text-[#786d65] hover:underline"
              >
                Skip & Continue as Guest
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
