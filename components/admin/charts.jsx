"use client";

import { useState } from "react";

export function DailyTrafficChart({ data = [] }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs font-mono text-gray-500">
        No traffic events recorded yet.
      </div>
    );
  }

  const height = 180;
  const width = 600;
  const padding = 24;

  const maxVal = Math.max(...data.map((d) => Math.max(d.views || 0, d.visitors || 0)), 10);

  // Generate SVG path points
  const pointsViews = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((d.views || 0) / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pointsVisitors = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((d.visitors || 0) / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  });

  const areaViews = `${padding},${height - padding} ${pointsViews.join(" ")} ${width - padding},${height - padding}`;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" /> Page Views
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" /> Unique Visitors
          </span>
        </div>
        {hovered && (
          <div className="text-xs font-mono text-gray-300 bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
            <span className="text-gray-400">{hovered.date}: </span>
            <span className="text-[#98f90d] font-bold">{hovered.views} views</span> ·{" "}
            <span className="text-cyan-400 font-bold">{hovered.visitors} visitors</span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full overflow-visible">
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#98f90d" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#98f90d" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, idx) => {
          const y = height - padding - ratio * (height - padding * 2);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <polygon points={areaViews} fill="url(#viewsGrad)" />

        {/* Line for Views */}
        <polyline
          fill="none"
          stroke="#98f90d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsViews.join(" ")}
        />

        {/* Line for Visitors */}
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsVisitors.join(" ")}
        />

        {/* Data points & hover triggers */}
        {data.map((d, i) => {
          const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - ((d.views || 0) / maxVal) * (height - padding * 2);
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle cx={x} cy={y} r="3.5" fill="#0c0e15" stroke="#98f90d" strokeWidth="2" />
            </g>
          );
        })}
      </svg>

      {/* X Axis labels */}
      <div className="mt-3 flex justify-between text-[10px] font-mono text-gray-500">
        <span>{data[0]?.date || ""}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.date || ""}</span>}
        <span>{data[data.length - 1]?.date || ""}</span>
      </div>
    </div>
  );
}

export function DeviceDonut({ devices = { Desktop: 0, Mobile: 0, Tablet: 0 } }) {
  const total = (devices.Desktop || 0) + (devices.Mobile || 0) + (devices.Tablet || 0);

  if (total === 0) {
    return <div className="py-6 text-center text-xs font-mono text-gray-500">No device data recorded yet</div>;
  }

  const deskPct = Math.round(((devices.Desktop || 0) / total) * 100);
  const mobPct = Math.round(((devices.Mobile || 0) / total) * 100);
  const tabPct = 100 - deskPct - mobPct;

  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06] p-0.5 border border-white/10">
        <div
          style={{ width: `${deskPct}%` }}
          className="bg-[#98f90d] rounded-full transition-all shadow-[0_0_8px_#98f90d]"
          title={`Desktop: ${deskPct}%`}
        />
        <div
          style={{ width: `${mobPct}%` }}
          className="bg-cyan-400 rounded-full transition-all shadow-[0_0_8px_#22d3ee]"
          title={`Mobile: ${mobPct}%`}
        />
        <div
          style={{ width: `${tabPct}%` }}
          className="bg-purple-400 rounded-full transition-all shadow-[0_0_8px_#c084fc]"
          title={`Tablet: ${tabPct}%`}
        />
      </div>
      <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="font-bold text-white text-sm">{deskPct}%</div>
          <div className="text-[11px] font-mono text-[#98f90d] mt-0.5">Desktop</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="font-bold text-white text-sm">{mobPct}%</div>
          <div className="text-[11px] font-mono text-cyan-400 mt-0.5">Mobile</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="font-bold text-white text-sm">{tabPct}%</div>
          <div className="text-[11px] font-mono text-purple-400 mt-0.5">Tablet</div>
        </div>
      </div>
    </div>
  );
}
