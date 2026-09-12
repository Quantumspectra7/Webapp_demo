/**
 * Indian localized formatting helpers for GramVest
 */

export function formatCurrency(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  
  // Format to Indian numbering system (Lakhs, Crores)
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  };

  const formatted = new Intl.NumberFormat("en-IN", options).format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCompactCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return "0";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value) || value === null || value === undefined) return "0%";
  return `${value.toFixed(decimals)}%`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
