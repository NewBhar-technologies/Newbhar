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
    .replace(/[,.():"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

