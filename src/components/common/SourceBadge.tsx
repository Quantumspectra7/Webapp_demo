import React from "react";
import { ConfidenceMetadata } from "@/domain";

interface SourceBadgeProps {
  metadata?: ConfidenceMetadata;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ metadata, className = "" }) => {
  if (!metadata) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f3ede6] text-[#706c63] border border-[#ddd6c9] ${className}`}
      title={`Source: ${metadata.source} (${metadata.sourceDate})`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#8a726b]"></span>
      <span className="truncate max-w-[220px]">{metadata.source}</span>
      <span className="text-[#a09a90]">• {metadata.sourceDate}</span>
    </div>
  );
};
