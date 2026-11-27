export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/guard";

// In-memory cache for live exchange rates
let cachedRate = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Fallback baseline rate in case external networks are blocked/unavailable
const DEFAULT_FALLBACK_USD_TO_INR = 86.85;

async function fetchLiveRate() {
  const apis = [
    {
      url: "https://open.er-api.com/v6/latest/USD",
      extract: (data) => {
        const rate = data?.rates?.INR;
        const time = data?.time_last_update_utc || new Date().toISOString();
        return rate && rate > 0 ? { rate: Number(rate), time } : null;
      },
    },
    {
      url: "https://api.exchangerate-api.com/v4/latest/USD",
      extract: (data) => {
        const rate = data?.rates?.INR;
        const time = data?.date ? new Date(data.date).toISOString() : new Date().toISOString();
        return rate && rate > 0 ? { rate: Number(rate), time } : null;
      },
    },
    {
      url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      extract: (data) => {
        const rate = data?.usd?.inr;
        const time = data?.date ? new Date(data.date).toISOString() : new Date().toISOString();
        return rate && rate > 0 ? { rate: Number(rate), time } : null;
      },
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(api.url, {
        signal: controller.signal,
        next: { revalidate: 1800 },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const extracted = api.extract(json);
        if (extracted && extracted.rate) {
          return {
            usdToInr: extracted.rate,
            updatedAt: extracted.time,
            source: api.url,
            isFallback: false,
          };
        }
      }
    } catch {
      // Try next fallback API
    }
  }

  return null;
}

export async function GET(req) {
  return withAdminAuth(req, null, async () => {
    try {
      const { searchParams } = new URL(req.url);
      const forceRefresh = searchParams.get("refresh") === "true" || searchParams.get("force") === "true";
      const now = Date.now();

      // Return cached rate if fresh and not forced
      if (!forceRefresh && cachedRate && now - lastCacheTime < CACHE_TTL_MS) {
        return NextResponse.json({
          success: true,
          ...cachedRate,
          cached: true,
          cacheAgeMs: now - lastCacheTime,
        });
      }

      const live = await fetchLiveRate();

      if (live) {
        cachedRate = {
          base: "USD",
          target: "INR",
          usdToInr: Number(live.usdToInr.toFixed(4)),
          inrToUsd: Number((1 / live.usdToInr).toFixed(6)),
          updatedAt: live.updatedAt,
          isFallback: false,
        };
        lastCacheTime = now;

        return NextResponse.json({
          success: true,
          ...cachedRate,
          cached: false,
        });
      }

      // If live fetch failed but we have a previous cache, serve that with a flag
      if (cachedRate) {
        return NextResponse.json({
          success: true,
          ...cachedRate,
          cached: true,
          isStale: true,
          warning: "Could not fetch newest live rate; using cached rate.",
        });
      }

      // Fallback rate if external network is unavailable (e.g. offline sandbox or remote failure)
      const fallbackRate = {
        base: "USD",
        target: "INR",
        usdToInr: DEFAULT_FALLBACK_USD_TO_INR,
        inrToUsd: Number((1 / DEFAULT_FALLBACK_USD_TO_INR).toFixed(6)),
        updatedAt: new Date().toISOString(),
        isFallback: true,
        warning: "Live exchange service temporarily unavailable. Using standard fallback rate.",
      };

      return NextResponse.json({
        success: true,
        ...fallbackRate,
        cached: false,
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err.message || "Failed to retrieve exchange rate",
          fallbackRate: {
            base: "USD",
            target: "INR",
            usdToInr: DEFAULT_FALLBACK_USD_TO_INR,
            inrToUsd: Number((1 / DEFAULT_FALLBACK_USD_TO_INR).toFixed(6)),
            updatedAt: new Date().toISOString(),
            isFallback: true,
          },
        },
        { status: 500 }
      );
    }
  });
}
