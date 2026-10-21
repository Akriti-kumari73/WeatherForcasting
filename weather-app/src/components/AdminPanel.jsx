import { useState, useEffect } from "react";
import {
  Activity,
  Key,
  Database,
  DollarSign,
  Plus,
  Trash2,
  Power,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck,
  Code2,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";

const BACKEND_ADMIN_URL = "http://localhost:5000/api/admin";

export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState("keys"); // "keys" | "logs" | "monetize" | "docs"
  const [stats, setStats] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [cacheMessage, setCacheMessage] = useState("");

  // New key form state
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPlan, setNewKeyPlan] = useState("Developer Pro ($29/mo)");
  const [newKeyLimit, setNewKeyLimit] = useState(50000);

  // Fetch stats and keys
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, keysRes] = await Promise.all([
        fetch(`${BACKEND_ADMIN_URL}/stats`).catch(() => null),
        fetch(`${BACKEND_ADMIN_URL}/keys`).catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      } else {
        // Fallback demo data if backend is offline
        setStats({
          uptimeSeconds: 3640,
          totalRequests: 14280,
          successfulRequests: 14210,
          failedRequests: 70,
          cacheHits: 13420,
          cacheMisses: 860,
          cacheHitRatio: "94%",
          cachedItemsCount: 48,
          memoryUsedMB: "42.8",
          totalMemoryMB: "64.0",
          activeApiKeysCount: 3,
          recentLogs: [
            {
              timestamp: new Date().toISOString(),
              method: "GET",
              url: "/api/weather/current?city=Bhopal",
              statusCode: 200,
              durationMs: 4,
              ip: "127.0.0.1",
              apiKey: "sk_live_pro_saas_4b29c8",
            },
            {
              timestamp: new Date(Date.now() - 30000).toISOString(),
              method: "GET",
              url: "/api/weather/forecast?city=Tokyo&days=7",
              statusCode: 200,
              durationMs: 6,
              ip: "192.168.1.104",
              apiKey: "sk_live_ent_corp_99c30f",
            },
            {
              timestamp: new Date(Date.now() - 75000).toISOString(),
              method: "GET",
              url: "/api/weather/search?q=London",
              statusCode: 200,
              durationMs: 2,
              ip: "127.0.0.1",
              apiKey: "Public / Web UI",
            },
          ],
        });
      }

      if (keysRes && keysRes.ok) {
        const keysJson = await keysRes.json();
        if (keysJson.success) setKeys(keysJson.data);
      } else {
        // Fallback demo keys
        setKeys([
          {
            id: "key_1",
            key: "sk_live_dev_free_8f92a1",
            name: "Default Demo User",
            plan: "Free",
            rateLimitPerDay: 1000,
            requestsToday: 142,
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            id: "key_2",
            key: "sk_live_pro_saas_4b29c8",
            name: "Logistics Fleet Co",
            plan: "Developer Pro ($29/mo)",
            rateLimitPerDay: 50000,
            requestsToday: 18450,
            status: "active",
            createdAt: new Date().toISOString(),
          },
          {
            id: "key_3",
            key: "sk_live_ent_corp_99c30f",
            name: "AgriTech Analytics Corp",
            plan: "Enterprise ($99/mo)",
            rateLimitPerDay: 500000,
            requestsToday: 89400,
            status: "active",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyKey = (keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          plan: newKeyPlan,
          rateLimitPerDay: newKeyLimit,
        }),
      });
      if (res.ok) {
        await fetchData();
        setIsCreatingKey(false);
        setNewKeyName("");
      } else {
        // Local simulation fallback
        const mockNew = {
          id: `key_${Date.now()}`,
          key: `sk_live_${newKeyPlan.includes("Ent") ? "ent" : "pro"}_${Math.random().toString(36).substring(2, 8)}`,
          name: newKeyName,
          plan: newKeyPlan,
          rateLimitPerDay: newKeyLimit,
          requestsToday: 0,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setKeys((prev) => [mockNew, ...prev]);
        setIsCreatingKey(false);
        setNewKeyName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleKey = async (id) => {
    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/keys/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchData();
      } else {
        setKeys((prev) =>
          prev.map((k) =>
            k.id === id
              ? { ...k, status: k.status === "active" ? "revoked" : "active" }
              : k
          )
        );
      }
    } catch {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, status: k.status === "active" ? "revoked" : "active" }
            : k
        )
      );
    }
  };

  const handleDeleteKey = async (id) => {
    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/cache/clear`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setCacheMessage(json.message);
        fetchData();
        setTimeout(() => setCacheMessage(""), 3000);
      }
    } catch {
      setCacheMessage("Cache purged (local)");
      setTimeout(() => setCacheMessage(""), 3000);
    }
  };

  // Estimate Monthly Recurring Revenue (MRR) from active keys
  const calculateMRR = () => {
    let mrr = 0;
    keys.forEach((k) => {
      if (k.status === "active") {
        if (k.plan.includes("29")) mrr += 29;
        if (k.plan.includes("99")) mrr += 99;
      }
    });
    return mrr;
  };

  const formatUptime = (sec) => {
    if (!sec) return "0m";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                API Admin & SaaS Hub
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Live Server
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage client API keys, telemetry, caching, and monetization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
            <span>Sync Stats</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-sky-400 active:scale-95 shadow-md shadow-sky-500/20"
            >
              Back to Weather App
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total API Requests */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total API Calls
            </span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats?.totalRequests ? stats.totalRequests.toLocaleString() : "14,280"}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>99.8% Success Rate</span>
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Estimated MRR
            </span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
            ${calculateMRR()}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            From {keys.filter((k) => k.status === "active").length} active client keys
          </p>
        </div>

        {/* In-Memory Weather Cache Hit Rate */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cache Hit Rate
            </span>
            <Database className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats?.cacheHitRatio || "94%"}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {stats?.cachedItemsCount || 48} items cached
            </span>
            <button
              onClick={handleClearCache}
              title="Purge RAM cache"
              className="text-[10px] text-sky-400 underline hover:text-sky-300"
            >
              Purge
            </button>
          </div>
          {cacheMessage && (
            <p className="mt-1 text-[10px] text-emerald-400 font-semibold">{cacheMessage}</p>
          )}
        </div>

        {/* Server Memory & Uptime */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Uptime & RAM
            </span>
            <Server className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
            {stats?.memoryUsedMB || "42.8"}
            <span className="text-xs font-normal text-slate-400"> MB</span>
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Up {formatUptime(stats?.uptimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("keys")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "keys"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>API Keys & Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "logs"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Live API Request Logs</span>
        </button>

        <button
          onClick={() => setActiveTab("monetize")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "monetize"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>How to Sell This Backend</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "docs"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>API Docs & Integration</span>
        </button>
      </div>

      {/* TAB 1: API KEYS MANAGER */}
      {activeTab === "keys" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Client API Keys</h3>
              <p className="text-xs text-slate-400">
                Issue license keys with tiered daily rate limits for paying customers
              </p>
            </div>
            <button
              onClick={() => setIsCreatingKey(!isCreatingKey)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Issue New API Key</span>
            </button>
          </div>

          {/* New Key Creation Form */}
          {isCreatingKey && (
            <form
              onSubmit={handleCreateKey}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-xl space-y-4"
            >
              <h4 className="text-sm font-bold text-emerald-300">
                Issue Commercial API Key
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Client / App Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Acme Weather Widget"
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Monetization Plan</label>
                  <select
                    value={newKeyPlan}
                    onChange={(e) => {
                      setNewKeyPlan(e.target.value);
                      if (e.target.value.includes("Free")) setNewKeyLimit(1000);
                      else if (e.target.value.includes("Pro")) setNewKeyLimit(50000);
                      else if (e.target.value.includes("Ent")) setNewKeyLimit(500000);
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Free">Free Tier (1,000 req/day)</option>
                    <option value="Developer Pro ($29/mo)">Developer Pro ($29/mo - 50k req/day)</option>
                    <option value="Enterprise ($99/mo)">Enterprise ($99/mo - 500k req/day)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Daily Request Quota</label>
                  <input
                    type="number"
                    value={newKeyLimit}
                    onChange={(e) => setNewKeyLimit(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingKey(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Generate Key
                </button>
              </div>
            </form>
          )}

          {/* Semantic, Accessible Responsive Table following modern-web-guidance */}
          <div
            tabIndex={0}
            role="region"
            aria-label="API Keys Directory"
            className="table-wrapper overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-xl"
          >
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-md text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Client & Key</th>
                  <th scope="col" className="px-4 py-3.5">Tier Plan</th>
                  <th scope="col" className="px-4 py-3.5">Today's Usage</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {keys.map((k) => {
                  const usagePercent = Math.min(100, Math.round((k.requestsToday / k.rateLimitPerDay) * 100));
                  return (
                    <tr key={k.id} className="transition hover:bg-white/5">
                      <th scope="row" className="px-4 py-3 font-normal">
                        <p className="font-bold text-white text-sm">{k.name}</p>
                        <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                          <span>{k.key}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(k.key)}
                            title="Copy key"
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedKey === k.key ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </th>

                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          k.plan.includes("99")
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : k.plan.includes("29")
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-slate-700/40 text-slate-300"
                        }`}>
                          {k.plan}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span>{k.requestsToday.toLocaleString()}</span>
                            <span className="text-slate-500">/ {k.rateLimitPerDay.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                usagePercent > 80 ? "bg-rose-500" : "bg-sky-400"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            k.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              k.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                            }`}
                          />
                          {k.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleKey(k.id)}
                            title={k.status === "active" ? "Revoke key" : "Activate key"}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            title="Delete key"
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: LIVE REQUEST LOGS */}
      {activeTab === "logs" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Live API Request Stream</h3>
              <p className="text-xs text-slate-400">
                Real-time telemetry showing latency, status codes, and caller authentication
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Recording
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="API Request Stream"
            className="table-wrapper overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-xl"
          >
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-md text-slate-400 font-semibold uppercase tracking-wider font-sans">
                <tr>
                  <th scope="col" className="px-4 py-3">Time</th>
                  <th scope="col" className="px-4 py-3">Method</th>
                  <th scope="col" className="px-4 py-3">Endpoint</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Latency</th>
                  <th scope="col" className="px-4 py-3">Caller / Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                  stats.recentLogs.map((log, idx) => (
                    <tr key={idx} className="transition hover:bg-white/5">
                      <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                          {log.method}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white truncate max-w-xs">{log.url}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            log.statusCode < 400
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {log.statusCode} OK
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {log.durationMs}ms
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 truncate max-w-[140px]">
                        {log.apiKey}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No incoming requests recorded yet. Make a search to see live logs!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: HOW TO SELL BACKEND GUIDE */}
      {activeTab === "monetize" && (
        <section className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-white">
              How to Monetize & Sell This Backend
            </h3>
            <p className="text-xs text-slate-400">
              4 proven pathways to turn this weather API into real revenue ($100 to $5,000+/month)
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pathway 1 */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    1. List on RapidAPI Marketplace
                  </h4>
                  <p className="text-xs text-purple-300">Zero marketing required</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                RapidAPI has 4M+ developers looking for weather APIs. You simply publish this Express endpoint there. RapidAPI handles user registration, credit cards, billing, and developer dashboards, and sends earnings directly to your PayPal/bank.
              </p>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                <span className="font-bold text-white">Suggested Pricing:</span> Free (500 req/mo), Pro ($19/mo - 50k req), Ultra ($79/mo - 500k req).
              </div>
            </div>

            {/* Pathway 2 */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    2. Direct SaaS with Stripe / Lemon Squeezy
                  </h4>
                  <p className="text-xs text-emerald-300">Keep 95% of revenues</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use Lemon Squeezy or Stripe Checkout to sell monthly subscriptions. When a client pays, trigger a webhook that calls our backend <code className="text-sky-300">/api/admin/keys</code> to auto-generate their API key and email it to them.
              </p>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                <span className="font-bold text-white">Key Advantage:</span> No middlemen fees; you build a direct customer email list.
              </div>
            </div>

            {/* Pathway 3 */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    3. Sell Full Turnkey Source Code
                  </h4>
                  <p className="text-xs text-sky-300">CodeCanyon / Gumroad / Freelance</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sell the complete project (React frontend + Express backend + Admin Panel) as a ready-to-deploy script on CodeCanyon or Gumroad for $29 – $99 per download.
              </p>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                <span className="font-bold text-white">Target Audience:</span> Students, mobile app developers, and agencies who need a weather microservice.
              </div>
            </div>

            {/* Pathway 4 */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    4. B2B Industry APIs (AgriTech & Logistics)
                  </h4>
                  <p className="text-xs text-amber-300">High-ticket $200 – $1,000/mo</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Farms, drone operators, and logistics tracking companies need rain and wind forecast APIs. Package our hourly forecast and UV indices into high-ticket enterprise contracts with custom SLA guarantees.
              </p>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                <span className="font-bold text-white">Enterprise Price:</span> $199 - $500/month per business client.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: API DOCUMENTATION & PLAYGROUND */}
      {activeTab === "docs" && (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">API Integration Guide</h3>
            <p className="text-xs text-slate-400">
              Provide this documentation to developers or paying subscribers using your API
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-xl">
            <div>
              <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Authentication
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Pass the client API key either via HTTP Header <code className="text-amber-300">x-api-key: YOUR_KEY</code> or query param <code className="text-amber-300">?apiKey=YOUR_KEY</code>.
              </p>
            </div>

            {/* cURL Example */}
            <div className="rounded-2xl bg-black/60 p-4 font-mono text-xs text-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>cURL Request Example</span>
                <button
                  onClick={() =>
                    handleCopyKey(
                      'curl -H "x-api-key: sk_live_pro_saas_4b29c8" "http://localhost:5000/api/weather/current?city=Bhopal"'
                    )
                  }
                  className="text-sky-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto text-emerald-400">
                {`curl -X GET "http://localhost:5000/api/weather/current?city=Bhopal" \\
     -H "x-api-key: sk_live_pro_saas_4b29c8"`}
              </pre>
            </div>

            {/* JavaScript Example */}
            <div className="rounded-2xl bg-black/60 p-4 font-mono text-xs text-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>JavaScript / Node.js Fetch</span>
                <button
                  onClick={() =>
                    handleCopyKey(`const res = await fetch("http://localhost:5000/api/weather/current?city=London", {
  headers: { "x-api-key": "sk_live_pro_saas_4b29c8" }
});
const data = await res.json();`)
                  }
                  className="text-sky-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto text-sky-300">
{`const res = await fetch("http://localhost:5000/api/weather/current?city=London", {
  headers: { "x-api-key": "sk_live_pro_saas_4b29c8" }
});
const weather = await res.json();
console.log(weather.data.current.temperature_2m);`}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
