'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, MapPin, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';

export default function AdminForecastPage() {
  const { user } = useAuth();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/forecast')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setForecastData(data.forecast || []);
          setHeatmap(data.heatmap || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Predictive Allocation Intelligence
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              7-Day Demand Forecast & Zone Heatmap
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Historical trends, seasonal weather forecasts, and residential demand spikes
            </p>
          </div>

          <Link
            href="/admin"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Admin Console
          </Link>
        </div>

        {/* Zone Heatmap Section */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F]">
                Regional Zone Heatmap
              </h3>
              <p className="text-xs text-gray-500">Live demand density across Chennai cooperative zones</p>
            </div>
            <span className="text-xs bg-blue-50 text-[#1F6BFF] font-bold px-3 py-1 rounded-full">
              4 Active Society Zones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmap.map((z, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0B1B3F]">{z.name}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      z.risk === 'HIGH'
                        ? 'bg-red-100 text-[#E5383B]'
                        : 'bg-green-100 text-[#1FA85A]'
                    }`}
                  >
                    {z.risk} Demand
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Demand Density</span>
                    <span className="font-bold text-gray-900">{z.demandIndex}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${z.risk === 'HIGH' ? 'bg-[#FF5A1F]' : 'bg-[#1F6BFF]'}`}
                      style={{ width: `${z.demandIndex}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between text-[11px] text-gray-600">
                  <span>{z.activeWorkers} Artisans</span>
                  <span>{z.pendingBookings} In Queue</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Demand Forecast Table */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F]">
                7-Day Service Projection (Plumbing & Electrical)
              </h3>
              <p className="text-xs text-gray-500">Predicted volume based on historical monsoon and weekend trends</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Historical (Avg)</th>
                  <th className="py-3 px-4">AI Forecasted</th>
                  <th className="py-3 px-4">Demand Level</th>
                  <th className="py-3 px-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forecastData.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B1B3F]">{f.date}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{f.service.name}</td>
                    <td className="py-3 px-4 text-gray-500">{f.historicalBookingsCount} bookings</td>
                    <td className="py-3 px-4 font-bold text-[#1F6BFF]">{f.forecastedBookingsCount} expected</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.demandLevel === 'HIGH'
                            ? 'bg-orange-100 text-[#FF5A1F]'
                            : 'bg-blue-100 text-[#1F6BFF]'
                        }`}
                      >
                        {f.demandLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{f.confidencePct}% match</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
