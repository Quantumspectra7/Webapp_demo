import test from "node:test";
import assert from "node:assert/strict";
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatDistance,
} from "../src/lib/formatters.ts";

test("formatCurrency formats Indian rupee amounts accurately", () => {
  const formatted = formatCurrency(300000);
  assert.ok(formatted.includes("3,00,000"), "Must use Indian grouping (3,00,000)");

  const zero = formatCurrency(0);
  assert.ok(zero.includes("0"), "Zero formatted properly");

  const negative = formatCurrency(-50000);
  assert.ok(negative.includes("-"), "Negative amounts show negative sign");
});

test("formatCompactCurrency formats Lakhs and Crores", () => {
  assert.equal(formatCompactCurrency(900000), "₹9.0 L");
  assert.equal(formatCompactCurrency(15000000), "₹1.50 Cr");
  assert.equal(formatCompactCurrency(25000), "₹25.0k");
});

test("formatNumber formats standard numbers with Indian commas", () => {
  assert.equal(formatNumber(42800), "42,800");
  assert.equal(formatNumber(14200), "14,200");
});

test("formatPercent formats decimals accurately", () => {
  assert.equal(formatPercent(35), "35.0%");
  assert.equal(formatPercent(12.34, 1), "12.3%");
});

test("formatDistance formats meters and kilometers", () => {
  assert.equal(formatDistance(0.45), "450 m");
  assert.equal(formatDistance(4.2), "4.2 km");
});
