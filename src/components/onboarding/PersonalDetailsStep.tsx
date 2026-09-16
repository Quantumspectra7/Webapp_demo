"use client";

import React, { useState } from "react";
import { User, Phone, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export interface PersonalDetails {
  name: string;
  phone: string;
  entrepreneurCategory: string;
  businessName: string;
}

interface PersonalDetailsStepProps {
  initialDetails?: Partial<PersonalDetails>;
  onConfirmDetails: (details: PersonalDetails) => void;
}

const ENTREPRENEUR_CATEGORIES = [
  { value: "farmer", label: "Farmer / Kisaan", emoji: "🌾" },
  { value: "rural_business", label: "Rural Business Owner", emoji: "🏪" },
  { value: "shg", label: "SHG / FPO Member", emoji: "👥" },
  { value: "youth_entrepreneur", label: "Youth Entrepreneur", emoji: "🚀" },
  { value: "cooperative", label: "Cooperative Society", emoji: "🤝" },
  { value: "other", label: "Other / Individual", emoji: "👤" },
];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  initialDetails,
  onConfirmDetails,
}) => {
  const [name, setName] = useState(initialDetails?.name || "");
  const [phone, setPhone] = useState(initialDetails?.phone || "");
  const [category, setCategory] = useState(initialDetails?.entrepreneurCategory || "");
  const [businessName, setBusinessName] = useState(initialDetails?.businessName || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      e.name = "Please enter your full name (at least 2 characters).";
    }
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""))) {
      e.phone = "Please enter a valid 10-digit Indian mobile number.";
    }
    if (!category) {
      e.category = "Please select your entrepreneur category.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onConfirmDetails({
      name: name.trim(),
      phone: phone.trim(),
      entrepreneurCategory: category,
      businessName: businessName.trim(),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <User size={13} />
          <span>Step 5 of 6</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          Tell us about yourself
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-xl">
          Your contact details help us personalize your feasibility dossier and send you the PDF report.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#ede3d8] p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#c75d3e]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sukhwinder Singh"
                autoComplete="name"
                className={`w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm text-[#241b16] focus:outline-none transition-colors ${
                  errors.name
                    ? "border-red-400 bg-red-50 focus:border-red-400"
                    : "border-[#ede3d8] focus:border-[#c75d3e] focus:ring-1 focus:ring-[#c75d3e]/20"
                }`}
              />
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-[#c75d3e]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                <Phone size={14} className="text-[#786d65]" />
                <span className="text-xs font-bold text-[#786d65] border-r border-[#ede3d8] pr-2">+91</span>
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
                placeholder="98765 43210"
                autoComplete="tel"
                className={`w-full rounded-xl border pl-16 pr-3 py-2.5 text-sm text-[#241b16] focus:outline-none transition-colors ${
                  errors.phone
                    ? "border-red-400 bg-red-50 focus:border-red-400"
                    : "border-[#ede3d8] focus:border-[#c75d3e] focus:ring-1 focus:ring-[#c75d3e]/20"
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Entrepreneur Category */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
              I am a... <span className="text-[#c75d3e]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ENTREPRENEUR_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer ${
                    category === cat.value
                      ? "border-[#c75d3e] bg-[#c75d3e]/5 text-[#241b16] shadow-sm"
                      : "border-[#ede3d8] hover:border-[#c75d3e]/40 text-[#786d65] hover:bg-[#faf4ee]"
                  }`}
                >
                  <span className="text-lg leading-none">{cat.emoji}</span>
                  <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                  {category === cat.value && (
                    <CheckCircle2 size={14} className="ml-auto text-[#c75d3e] shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1.5">{errors.category}</p>
            )}
          </div>

          {/* Business / Venture Name (optional) */}
          <div>
            <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
              Business / Venture Name{" "}
              <span className="text-[10px] font-normal normal-case text-[#786d65]">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Singh Dairy Unit, Pind Agro Foods"
                className="w-full rounded-xl border border-[#ede3d8] pl-9 pr-3 py-2.5 text-sm text-[#241b16] focus:border-[#c75d3e] focus:ring-1 focus:ring-[#c75d3e]/20 focus:outline-none transition-colors"
              />
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-[11px] text-[#786d65] leading-relaxed pt-1">
            🔒 No PAN, Aadhaar or banking credentials required. Your data is used only to generate your feasibility report.
          </p>

          {/* CTA */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start My Analysis</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
