"use client";

import React, { useState, useMemo } from "react";
import { financePreviewService } from "@/services";
import { formatCurrency } from "@/lib/formatters";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Info,
  BadgePercent,
  Landmark,
  Building,
} from "lucide-react";

interface CapitalStepProps {
  initialCapital: number;
  onConfirmCapital: (capital: number) => void;
}

const QUICK_AMOUNTS = [
  { label: "₹50,000", value: 50000 },
  { label: "₹1,00,000", value: 100000 },
  { label: "₹2,00,000", value: 200000 },
  { label: "₹5,00,000", value: 500000 },
  { label: "₹10,00,000+", value: 1000000 },
];

export const CapitalStep: React.FC<CapitalStepProps> = ({
  initialCapital,
  onConfirmCapital,
}) => {
  const [capital, setCapital] = useState<number>(initialCapital || 100000);
  const [inputStr, setInputStr] = useState<string>(
    initialCapital ? initialCapital.toString() : "100000"
  );
  const [error, setError] = useState<string | null>(null);

  // Live capital structure preview from financePreviewService
  const preview = useMemo(() => {
    return financePreviewService.calculateCapitalStructure(capital);
  }, [capital]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputStr(raw);
    const num = parseInt(raw, 10);
    if (isNaN(num) || num <= 0) {
      setError("Enter a valid amount greater than ₹0.");
      setCapital(0);
    } else {
      setError(null);
      setCapital(num);
    }
  };

  const handleQuickSelect = (amt: number) => {
    setCapital(amt);
    setInputStr(amt.toString());
    setError(null);
  };

  const handleConfirm = () => {
    if (capital <= 0) {
      setError("Enter a valid amount greater than ₹0.");
      return;
    }
    onConfirmCapital(capital);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <Wallet size={13} />
          <span>Step 3 of 5</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          How much can you invest yourself?
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-2xl">
          This is the amount you are comfortable contributing toward the business from your own
          savings or family funds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Input + Quick Chips */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-[#ede3d8] p-5 sm:p-6 shadow-2xs">
          <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
            Your Own Capital Contribution
          </label>

          {/* Large Numeric Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-[#786d65] font-serif">
              ₹
            </span>
            <input
              type="text"
              value={inputStr}
              onChange={handleInputChange}
              className="w-full rounded-2xl border-2 border-[#ede3d8] bg-[#faf4ee]/40 pl-12 pr-4 py-3 sm:py-4 text-2xl sm:text-3xl font-bold text-[#241b16] font-mono focus:border-[#c75d3e] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
          )}

          {/* Quick Option Chips */}
          <div className="mt-5">
            <span className="block text-xs font-semibold text-[#786d65] mb-2">
              Common investment amounts:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleQuickSelect(item.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    capital === item.value
                      ? "bg-[#c75d3e] text-white border-[#c75d3e] shadow-2xs"
                      : "bg-[#faf4ee] border-[#ede3d8] text-[#786d65] hover:text-[#1d1b18] hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#ede3d8] flex items-center justify-between text-xs text-[#786d65]">
            <span>Need a custom amount?</span>
            <span className="font-semibold text-[#241b16]">Type any value above</span>
          </div>
        </div>

        {/* Right Column: Capital -> Project Capacity Preview */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="bg-[#faf4ee] rounded-2xl border-2 border-[#ede3d8] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#c75d3e]">
                Indicative Project Capacity
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#ede3d8] text-[#241b16]">
                {preview.routeType === "micro" ? "Micro Finance Route" : "Term Loan Route"}
              </span>
            </div>

            {/* Breakdown Cards */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3.5 border border-[#ede3d8] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#786d65]">Your Contribution</p>
                  <p className="text-lg font-bold text-[#241b16] font-mono">
                    {formatCurrency(preview.ownCapital)}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#ede3d8]/50 text-[#786d65]">
                  10% Equity
                </span>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-[#ede3d8] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#786d65]">Indicative Project Size</p>
                  <p className="text-xl font-bold text-[#c75d3e] font-mono">
                    {formatCurrency(preview.indicativeProjectSize)}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#c75d3e]/10 text-[#c75d3e]">
                  Total Scope
                </span>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-[#ede3d8] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#786d65]">Indicative Financing Component</p>
                  <p className="text-base font-bold text-[#3a6b4c] font-mono">
                    {formatCurrency(preview.indicativeFinancingComponent)}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#3a6b4c]/10 text-[#3a6b4c]">
                  90% Debt/Scheme
                </span>
              </div>
            </div>

            {/* Explanatory Disclaimer */}
            <div className="mt-4 p-3 rounded-xl bg-white/70 border border-[#ede3d8] text-[11px] text-[#786d65] flex items-start gap-2">
              <Info size={14} className="shrink-0 mt-0.5 text-[#c75d3e]" />
              <p>{preview.disclaimer}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={capital <= 0}
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] disabled:opacity-50 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm Capital & Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
