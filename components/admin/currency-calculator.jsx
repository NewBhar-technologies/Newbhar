"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeftRight,
  RefreshCw,
  Sliders,
  DollarSign,
  RotateCcw,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const STORAGE_KEY = "newbhar_crm_exchange_rate";

export function CurrencyCalculator({ className = "" }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  // Exchange rate states
  const [rateData, setRateData] = useState({
    usdToInr: 86.85,
    inrToUsd: 0.011514,
    updatedAt: null,
    isFallback: false,
    cached: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Manual override states
  const [useOverride, setUseOverride] = useState(false);
  const [customRate, setCustomRate] = useState("");

  // Load cached rate from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.usdToInr > 0) {
          setRateData(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const fetchExchangeRate = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = `/api/admin/exchange-rate${isManualRefresh ? "?refresh=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        const updated = {
          usdToInr: Number(data.usdToInr),
          inrToUsd: Number(data.inrToUsd),
          updatedAt: data.updatedAt,
          isFallback: Boolean(data.isFallback),
          cached: Boolean(data.cached),
          warning: data.warning || null,
        };
        setRateData(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      } else {
        setError(data.error || "Failed to fetch exchange rate");
      }
    } catch (err) {
      setError(err.message || "Network error while fetching exchange rates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate(false);
  }, [fetchExchangeRate]);

  // Current effective rate considering override
  const effectiveUsdToInr = useMemo(() => {
    if (useOverride && customRate && !isNaN(Number(customRate)) && Number(customRate) > 0) {
      return Number(customRate);
    }
    return rateData.usdToInr || 86.85;
  }, [useOverride, customRate, rateData.usdToInr]);

  // Handle Swap
  const handleSwap = () => {
    setFromCurrency((prev) => (prev === "USD" ? "INR" : "USD"));
    setToCurrency((prev) => (prev === "INR" ? "USD" : "INR"));
  };

  // Handle Clean Numeric Input (support decimals)
  const handleAmountChange = (e) => {
    const val = e.target.value;
    // Allow digits and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
      setAmount(val);
    }
  };

  // Conversions
  const numericAmount = useMemo(() => {
    const n = parseFloat(amount);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [amount]);

  const convertedValue = useMemo(() => {
    if (numericAmount <= 0) return 0;
    if (fromCurrency === "USD" && toCurrency === "INR") {
      return numericAmount * effectiveUsdToInr;
    }
    if (fromCurrency === "INR" && toCurrency === "USD") {
      return numericAmount / effectiveUsdToInr;
    }
    return numericAmount;
  }, [numericAmount, fromCurrency, toCurrency, effectiveUsdToInr]);

  // Format Currency Strings
  const formattedConverted = useMemo(() => {
    if (numericAmount <= 0) {
      return toCurrency === "USD" ? "$ 0.00" : "₹ 0.00";
    }
    if (toCurrency === "INR") {
      try {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedValue);
      } catch {
        return `₹ ${convertedValue.toFixed(2)}`;
      }
    } else {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedValue);
      } catch {
        return `$ ${convertedValue.toFixed(2)}`;
      }
    }
  }, [convertedValue, numericAmount, toCurrency]);

  const formattedRate = useMemo(() => {
    if (fromCurrency === "USD") {
      return `1 USD = ₹ ${effectiveUsdToInr.toFixed(2)} INR`;
    }
    const inv = 1 / effectiveUsdToInr;
    return `1 INR = $ ${inv.toFixed(4)} USD`;
  }, [fromCurrency, effectiveUsdToInr]);

  const formattedDate = useMemo(() => {
    if (!rateData.updatedAt) return "Loading...";
    try {
      const d = new Date(rateData.updatedAt);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(rateData.updatedAt);
    }
  }, [rateData.updatedAt]);

  const handleClear = () => {
    setAmount("");
  };

  const handleReset = () => {
    setAmount("");
    setFromCurrency("USD");
    setToCurrency("INR");
    setUseOverride(false);
    setCustomRate("");
  };

  const quickPresets = fromCurrency === "USD"
    ? [100, 500, 1000, 2500, 5000]
    : [10000, 25000, 50000, 100000, 500000];

  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#0c0e15] shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#98f90d]/10 text-[#98f90d] border border-[#98f90d]/20">
            <ArrowLeftRight size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono tracking-tight">
                Live USD ↔ INR Calculator
              </span>
              {useOverride ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 text-[9px] font-mono text-amber-300">
                  Custom Rate
                </span>
              ) : rateData.isFallback ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.2 text-[9px] font-mono text-blue-300">
                  Fallback Rate
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/30 px-2 py-0.2 text-[9px] font-mono text-[#98f90d]">
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono mt-0.5">
              <span>{formattedRate}</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={10} />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refresh Rate button */}
          <button
            type="button"
            onClick={() => fetchExchangeRate(true)}
            disabled={refreshing || loading}
            title="Refresh live exchange rate from API"
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/20 transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin text-[#98f90d]" : ""} />
          </button>

          {/* Toggle Override */}
          <button
            type="button"
            onClick={() => {
              if (!useOverride && !customRate) {
                setCustomRate(String(rateData.usdToInr || 86.85));
              }
              setUseOverride(!useOverride);
            }}
            title="Override exchange rate manually"
            className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-[10px] font-mono font-bold border transition ${
              useOverride
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"
            }`}
          >
            <Sliders size={11} />
            <span className="hidden sm:inline">Override</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Calculator" : "Expand Calculator"}
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white transition"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Calculator Body */}
      {isExpanded && (
        <div className="p-4 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-rose-300 font-mono">
              <AlertCircle size={14} className="shrink-0 text-rose-400" />
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => fetchExchangeRate(true)}
                className="text-[10px] font-bold text-rose-300 underline hover:text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* Manual Override Input if enabled */}
          {useOverride && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-300 font-bold">
                  Custom Exchange Rate:
                </span>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={customRate}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^[0-9]*\.?[0-9]*$/.test(v)) setCustomRate(v);
                    }}
                    placeholder="86.85"
                    className="w-full rounded-lg border border-amber-500/40 bg-[#0c0e15] pl-6 pr-2 py-1 text-xs text-amber-200 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400">per 1 USD</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUseOverride(false);
                  setCustomRate("");
                }}
                className="text-[10px] font-mono text-gray-400 hover:text-white underline"
              >
                Reset to Live Rate ({rateData.usdToInr} INR)
              </button>
            </div>
          )}

          {/* Input & Output Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Amount input + From currency */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-gray-400 flex items-center justify-between">
                <span>Convert Amount</span>
                <span>From</span>
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-[#12141e] focus-within:border-[#98f90d] transition">
                <span className="pl-3 pr-1 text-xs font-mono font-bold text-gray-400">
                  {fromCurrency === "USD" ? "$" : "₹"}
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount (e.g. 1500.50)"
                  className="w-full bg-transparent px-2 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none"
                />
                {amount && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear input"
                    className="p-1 text-gray-400 hover:text-white mr-1"
                  >
                    <X size={13} />
                  </button>
                )}
                <select
                  value={fromCurrency}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setFromCurrency(newFrom);
                    setToCurrency(newFrom === "USD" ? "INR" : "USD");
                  }}
                  className="rounded-r-xl border-l border-white/10 bg-[#181a26] px-2.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex items-center justify-center pt-2 md:pt-4">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap From and To currencies"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-mono text-gray-300 hover:border-[#98f90d]/60 hover:text-[#98f90d] hover:bg-[#98f90d]/10 transition shadow-sm active:scale-95"
              >
                <ArrowLeftRight size={13} />
                <span className="text-[10px] uppercase font-bold">Swap</span>
              </button>
            </div>

            {/* Converted Amount Output + To currency */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase text-gray-400 flex items-center justify-between">
                <span>Converted Value</span>
                <span>To: {toCurrency}</span>
              </label>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#12141e] px-3 py-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-base font-extrabold font-mono text-[#98f90d] tracking-tight">
                    {formattedConverted}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">
                    {numericAmount > 0
                      ? `${fromCurrency === "USD" ? "$" : "₹"}${numericAmount.toLocaleString()} @ ${formattedRate}`
                      : "Awaiting input amount"}
                  </span>
                </div>
                <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-mono font-bold text-gray-200 border border-white/10">
                  {toCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets & Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.05]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-gray-500 mr-1">Quick:</span>
              {quickPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className={`rounded-lg border px-2 py-0.5 text-[10px] font-mono font-medium transition ${
                    numericAmount === val
                      ? "bg-[#98f90d]/15 border-[#98f90d] text-[#98f90d]"
                      : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {fromCurrency === "USD" ? `$${val.toLocaleString()}` : `₹${val.toLocaleString()}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={!amount}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-mono font-medium text-gray-400 hover:text-white hover:border-white/20 transition disabled:opacity-40"
              >
                <X size={11} />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-mono font-medium text-gray-400 hover:text-white hover:border-white/20 transition"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
