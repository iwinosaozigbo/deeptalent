"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Check,
  CreditCard,
  GraduationCap,
  Mail,
  Receipt,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";

const BRAND = "#3B5BDB";

type SourceKey = "course" | "reprint" | "credits";

type Payload = {
  summary: {
    total_ngn: number;
    total_count: number;
    this_month_ngn: number;
    last_month_ngn: number;
  };
  by_source: { key: SourceKey; label: string; count: number; total_ngn: number }[];
  months: { key: string; label: string; total_ngn: number; count: number }[];
  recent: {
    ref: string;
    source: SourceKey;
    source_label: string;
    amount_ngn: number;
    at: string;
    payer_name: string | null;
    payer_email: string | null;
  }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function ngn(value: number) {
  return `₦${(value || 0).toLocaleString("en-NG")}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const SOURCE_META: Record<SourceKey, { icon: any; tone: string }> = {
  course: { icon: GraduationCap, tone: "bg-amber-50 text-amber-600" },
  reprint: { icon: Receipt, tone: "bg-emerald-50 text-emerald-600" },
  credits: { icon: CreditCard, tone: "bg-indigo-50 text-indigo-600" },
};

export function FinancesTab() {
  const { data, isLoading, mutate } = useSWR<Payload>("/api/admin/finances", fetcher, {
    refreshInterval: 60_000,
  });

  const summary = data?.summary ?? {
    total_ngn: 0,
    total_count: 0,
    this_month_ngn: 0,
    last_month_ngn: 0,
  };
  const bySource = data?.by_source ?? [];
  const months = data?.months ?? [];
  const recent = data?.recent ?? [];

  const delta = summary.last_month_ngn
    ? Math.round(((summary.this_month_ngn - summary.last_month_ngn) / summary.last_month_ngn) * 100)
    : summary.this_month_ngn > 0
      ? 100
      : 0;
  const up = delta >= 0;

  // Per-row receipt state, keyed by tx_ref: "sending" | "sent" | "error".
  const [receiptState, setReceiptState] = useState<Record<string, "sending" | "sent" | "error">>({});

  async function sendReceipt(ref: string, source: SourceKey, hasEmail: boolean) {
    if (!hasEmail || receiptState[ref] === "sending") return;
    setReceiptState((s) => ({ ...s, [ref]: "sending" }));
    try {
      const res = await fetch("/api/admin/finances/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, source }),
      });
      setReceiptState((s) => ({ ...s, [ref]: res.ok ? "sent" : "error" }));
    } catch {
      setReceiptState((s) => ({ ...s, [ref]: "error" }));
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="size-5 text-[#3B5BDB]" />
            Finances
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Total revenue across every paid feature on the site — course enrolments, certificate
            reprints and AI credits.
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors self-start"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
        <div className="lg:col-span-2 rounded-2xl bg-[#0b1b4d] p-5 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#3B5BDB]/40 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
              <BadgeDollarSign className="size-4" /> Total revenue (all time)
            </span>
            <p className="mt-2 text-4xl font-bold tabular-nums">{ngn(summary.total_ngn)}</p>
            <p className="mt-1 text-sm text-white/60">{summary.total_count} successful payments</p>
          </div>
        </div>

        <StatCard
          label="This month"
          value={ngn(summary.this_month_ngn)}
          icon={TrendingUp}
          tone="bg-[#3B5BDB]/10 text-[#3B5BDB]"
          footer={
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta)}% vs last month
            </span>
          }
        />
        <StatCard
          label="Last month"
          value={ngn(summary.last_month_ngn)}
          icon={Wallet}
          tone="bg-gray-100 text-gray-600"
        />
      </div>

      {/* Per-source breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {bySource.map((s) => {
          const meta = SOURCE_META[s.key];
          const Icon = meta.icon;
          const share = summary.total_ngn ? Math.round((s.total_ngn / summary.total_ngn) * 100) : 0;
          return (
            <div key={s.key} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`grid size-10 place-items-center rounded-xl ${meta.tone}`}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.count} payments</p>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 tabular-nums">{ngn(s.total_ngn)}</p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#3B5BDB]" style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">{share}% of total</p>
            </div>
          );
        })}
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Revenue trend</h3>
          <p className="text-xs text-gray-400">Last 12 months</p>
        </div>
        <div className="h-[220px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={months} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={54}
                tickFormatter={(v) => (v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`)}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                formatter={(v) => [ngn(Number(v)), "Revenue"] as [string, string]}
              />
              <Area type="monotone" dataKey="total_ngn" stroke={BRAND} strokeWidth={2.5} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Recent payments</h3>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin" /> Loading payments…
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Payer", "Source", "Amount", "Date", "Receipt"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((t) => {
                  const meta = SOURCE_META[t.source];
                  const Icon = meta.icon;
                  return (
                    <tr key={t.ref} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{t.payer_name || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.payer_email || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.tone}`}>
                          <Icon className="size-3.5" /> {t.source_label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {ngn(t.amount_ngn)}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(t.at)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {(() => {
                          const state = receiptState[t.ref];
                          const hasEmail = Boolean(t.payer_email);
                          if (state === "sent") {
                            return (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                <Check className="size-3.5" /> Sent
                              </span>
                            );
                          }
                          return (
                            <button
                              onClick={() => sendReceipt(t.ref, t.source, hasEmail)}
                              disabled={!hasEmail || state === "sending"}
                              title={hasEmail ? "Email this receipt to the payer" : "No email on file"}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-[#3B5BDB]/40 hover:text-[#3B5BDB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Mail className={`size-3.5 ${state === "sending" ? "animate-pulse" : ""}`} />
                              {state === "sending" ? "Sending…" : state === "error" ? "Retry" : "Send"}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  footer,
}: {
  label: string;
  value: string;
  icon: any;
  tone: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`grid size-9 place-items-center rounded-xl ${tone}`}>
          <Icon className="size-4.5" />
        </span>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  );
}
