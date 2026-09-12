import React from "react";

interface StatusPillProps {
  label: string;
  status: string;
  tone?: "positive" | "caution" | "warning";
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  status,
  tone = "positive",
  className = "",
}) => {
  let dotColor = "bg-[#416246]";
  if (tone === "caution") dotColor = "bg-[#caa739]";
  if (tone === "warning") dotColor = "bg-[#c75d3e]";

  return (
    <div
      className={`flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-lg shadow-sm border border-[#ddd6c9] ${className}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-[#706c63] font-semibold leading-tight">
          {label}
        </span>
        <span className="text-[14px] font-bold text-[#1d1b18] leading-snug">{status}</span>
      </div>
    </div>
  );
};
