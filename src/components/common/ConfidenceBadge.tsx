import React from "react";

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low" | "provisional";
  status?: "live" | "demo" | "verified" | "audited";
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  status = "verified",
  className = "",
}) => {
  let badgeColor = "bg-[#dde6da] text-[#4d7558] border-[#bbcca9]";
  if (confidence === "medium") {
    badgeColor = "bg-[#f3e6b5] text-[#b88537] border-[#e8c352]";
  } else if (confidence === "low" || confidence === "provisional") {
    badgeColor = "bg-[#ffdad6] text-[#ba1a1a] border-[#ffb5a0]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${badgeColor} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{confidence} Confidence</span>
      {status === "demo" && (
        <span className="opacity-70 normal-case font-normal">(Demo)</span>
      )}
    </span>
  );
};
