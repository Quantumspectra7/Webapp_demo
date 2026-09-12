"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, ShieldCheck, ExternalLink, X } from "lucide-react";

interface EvidencePopoverProps {
  title: string;
  source: string;
  sourceYear?: string;
  status?: string;
  confidence?: "high" | "medium" | "low" | "provisional";
  note?: string;
}

export const EvidencePopover: React.FC<EvidencePopoverProps> = ({
  title,
  source,
  sourceYear = "2026",
  status = "Reference Benchmark",
  confidence = "high",
  note,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-[#786d65] hover:text-[#c75d3e] transition-colors rounded-full hover:bg-[#ede3d8]/40 cursor-pointer"
        aria-label={`Evidence source details for ${title}`}
        title="View data evidence & confidence details"
      >
        <Info size={13} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-2xl bg-white border border-[#ede3d8] p-4 shadow-xl text-xs text-[#241b16] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ede3d8]">
            <span className="font-bold text-[#241b16]">{title}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#786d65] hover:text-[#241b16] p-0.5"
            >
              <X size={13} />
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-[#786d65] block">Primary Source:</span>
              <span className="font-semibold text-[#241b16]">{source}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ede3d8]/60">
              <div>
                <span className="text-[#786d65] block">Reference Year:</span>
                <span className="font-medium text-[#241b16]">{sourceYear}</span>
              </div>
              <div>
                <span className="text-[#786d65] block">Audit Status:</span>
                <span className="font-medium text-[#3a6b4c]">{status}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#ede3d8]/60 flex items-center justify-between">
              <span className="text-[#786d65]">Confidence Rating:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  confidence === "high"
                    ? "bg-[#3a6b4c]/10 text-[#3a6b4c]"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {confidence}
              </span>
            </div>

            {note && (
              <div className="mt-2 p-2 rounded-xl bg-[#faf4ee] border border-[#ede3d8] text-[10px] text-[#786d65] leading-relaxed">
                <span className="font-semibold text-[#241b16] block mb-0.5">
                  Coverage Note:
                </span>
                {note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
