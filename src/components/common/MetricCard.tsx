import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  delta?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  delta,
  icon,
  badge,
  className = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-[#ddd6c9] shadow-sm transition-all hover:border-[#b8aba0] ${
        onClick ? "cursor-pointer hover:shadow" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[12px] uppercase font-bold tracking-wider text-[#706c63]">
          {label}
        </span>
        {icon && <div className="text-[#8a726b]">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-bold text-[#1d1b18] tracking-tight tabular-nums">
          {value}
        </span>
        {badge}
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        {sublabel && (
          <span className="text-[12px] text-[#706c63] font-medium leading-snug">
            {sublabel}
          </span>
        )}
        {delta && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              delta.isPositive
                ? "bg-[#dde6da] text-[#4d7558]"
                : "bg-[#ffdad6] text-[#ba1a1a]"
            }`}
          >
            {delta.isPositive ? "+" : ""}
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
};
