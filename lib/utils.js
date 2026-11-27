import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...i) => twMerge(clsx(i));

/**
 * Sanitizes search input for Supabase PostgREST `.or(...)` filter clauses.
 * Strips characters that break or manipulate PostgREST filter expressions:
 * commas (separators), parentheses (grouping), colons, dots, quotes, and backslashes.
 */
export function sanitizePostgrestSearch(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/[,():"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses user/contact budget strings into numeric USD values.
 * Handles:
 * - Specific USD ranges:
 *   "Under $100" -> 75
 *   "$100 – $500" -> 250
 *   "$500 – $1,000" -> 750
 *   "$1,000 – $2,500" -> 1750
 *   "$2,500 – $5,000" -> 3750
 *   "$5,000+" -> 5000
 * - Direct numbers / strings: "100" -> 100, "$500" -> 500, "$1,000" -> 1000
 * - Generic ranges: "100 - 500" -> midpoint 250
 * - Legacy INR strings: "₹15,000" -> converted to USD (~$176) to prevent 1:1 reinterpretation
 * - Flexible/unspecified/empty/null -> 0
 */
export function parseBudgetValue(input) {
  if (input === null || input === undefined) return 0;
  if (typeof input === "number") {
    return isNaN(input) || input < 0 ? 0 : Math.round(input);
  }
  const str = String(input).trim();
  if (!str) return 0;
  if (/flexible|undetermined|not\s*specified|none|unspecified/i.test(str)) return 0;

  // Handle legacy INR strings to prevent silent 1:1 reinterpretation as USD
  const isINR = /₹|\binr\b/i.test(str);
  if (isINR) {
    const lakhMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|l)\b/i);
    if (lakhMatch) {
      const inrVal = parseFloat(lakhMatch[1]) * 100000;
      return Math.round(inrVal / 85);
    }
    const matchNum = str.match(/([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]+(?:\.[0-9]+)?)/);
    if (matchNum) {
      const cleanNum = matchNum[1].replace(/,/g, "");
      const inrVal = parseFloat(cleanNum);
      return isNaN(inrVal) || inrVal < 0 ? 0 : Math.round(inrVal / 85);
    }
    return 0;
  }

  // Predefined USD budget ranges
  if (/under\s*\$?\s*100|<\s*\$?\s*100/i.test(str)) return 75;
  if (/\$?\s*100\s*[-–]\s*\$?\s*500/i.test(str)) return 250;
  if (/\$?\s*500\s*[-–]\s*\$?\s*1,?000/i.test(str)) return 750;
  if (/\$?\s*1,?000\s*[-–]\s*\$?\s*2,?500/i.test(str)) return 1750;
  if (/\$?\s*2,?500\s*[-–]\s*\$?\s*5,?000/i.test(str)) return 3750;
  if (/\$?\s*5,?000\s*\+/i.test(str)) return 5000;

  // General range "min - max" or "min – max"
  const rangeMatch = str.match(/\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*[-–]\s*\$?\s*([0-9,]+(?:\.[0-9]+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(/,/g, ""));
    const max = parseFloat(rangeMatch[2].replace(/,/g, ""));
    if (!isNaN(min) && !isNaN(max)) return Math.round((min + max) / 2);
  }

  // "k" notation e.g. "$5k", "5k"
  const kMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Numbers with commas or currency signs ($50, 100, 1,000, etc.)
  const matchNum = str.match(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+(?:\.[0-9]+)?)/);
  if (matchNum) {
    const cleanNum = matchNum[1].replace(/,/g, "");
    const val = parseFloat(cleanNum);
    return isNaN(val) || val < 0 ? 0 : Math.round(val);
  }

  return 0;
}

/**
 * Formats a deal or budget number using USD ($).
 * Defaults to "Budget not specified" when value is 0, null, or empty.
 * Set options.zeroAsCurrency = true to format 0 as "$0" (e.g. for totals).
 */
export function formatCurrencyUSD(value, options = {}) {
  const { zeroAsCurrency = false, fallback = "Budget not specified" } = options;
  if (value === null || value === undefined || value === "") {
    return zeroAsCurrency ? "$0" : fallback;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num) || num < 0) {
    return fallback;
  }
  if (num === 0) {
    return zeroAsCurrency ? "$0" : fallback;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `$${Math.round(num).toLocaleString("en-US")}`;
  }
}

/** Default currency formatter is now USD */
export const formatCurrency = formatCurrencyUSD;

/**
 * Legacy formatter for INR backward compatibility.
 */
export function formatCurrencyINR(value, options = {}) {
  const { zeroAsCurrency = false, fallback = "Budget not specified" } = options;
  if (value === null || value === undefined || value === "") {
    return zeroAsCurrency ? "₹0" : fallback;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num) || num < 0) {
    return fallback;
  }
  if (num === 0) {
    return zeroAsCurrency ? "₹0" : fallback;
  }
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${Math.round(num).toLocaleString("en-IN")}`;
  }
}



