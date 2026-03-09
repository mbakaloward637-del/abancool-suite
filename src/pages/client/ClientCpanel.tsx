import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Monitor, HardDrive, Mail, Database, Cpu, Activity, RefreshCw, Lock, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const API_BASE = "https://api.abancool.com";

const quickActions = [
  { label: "File Manager", icon: HardDrive, path: "filemanager" },
  { label: "Email Accounts", icon: Mail, path: "email" },
  { label: "Databases", icon: Database, path: "databases" },
  { label: "Resource Usage", icon: Activity, path: "resource_usage" },
];

interface PanelStats {
  disk: { used_mb: number; limit_mb: number; percent: number };
  bandwidth: { used_mb: number; limit_mb: number; percent: number };
  email: { count: number; limit: number };
  databases: { count: number; limit: number };
  plan_name: string;
  status: string;
  panel_type: "cpanel" | "directadmin";
  expires_at: string | null;
  provisioned: boolean;
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token ?? ""}`,
    "Content-Type": "application/json",
  };
}

export default function ClientCpanel() {
  const [showIframe, setShowIframe] = useState(false);
  const [hasHosting, setHasHosting] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PanelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [domain, setDomain] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();

      // Check status first
      const statusRes = await fetch(`${API_BASE}/api/cpanel/status`, { headers });
      const statusData = await statusRes.json();

      if (!statusData.has_hosting) {
        setHasHosting(false);
        setLoading(false);
        return;
      }

      setHasHosting(true);
      setDomain(statusData.domain || "No domain set");

      // Fetch real stats
      const statsRes = await fetch(`${API_BASE}/api/cpanel/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch panel data:", err);
      // Fallback: check local DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("hosting_orders")
          .select("id, domain, status, cpanel_url, cpanel_username, expires_at, hosting_plans(name, disk_space_gb, bandwidth_gb, email_accounts, databases)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (data) {
          setHasHosting(true);
          setDomain(data.domain || "No domain set");
        } else {
          setHasHosting(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleOpenPanel = async () => {
    setSsoLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/cpanel/sso`, { headers });
      const data = await res.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        console.error("SSO failed:", data.error);
      }
    } catch (err) {
      console.error("SSO request failed:", err);
    } finally {
      setSsoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-sm gradient-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-heading font-bold text-xs">A</span>
        </div>
      </div>
    );
  }

  if (!hasHosting) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">cPanel Management</h1>
        <div className="rounded-xl bg-card border card-shadow p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-xl font-semibold">Hosting Required</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need an active hosting plan to access cPanel. Purchase a hosting plan and cPanel access will be unlocked automatically once payment is confirmed.
          </p>
          <Link to="/client/dashboard/hosting">
            <Button className="gradient-primary text-primary-foreground border-0 mt-2">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Browse Hosting Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const panelLabel = stats?.panel_type === "directadmin" ? "DirectAdmin" : "cPanel";

  const cpanelStats = [
    {
      icon: HardDrive,
      label: "Disk Space",
      value: stats ? `${stats.disk.used_mb} / ${stats.disk.limit_mb === -1 ? "∞" : stats.disk.limit_mb} MB` : "—",
      percent: stats?.disk.percent ?? 0,
    },
    {
      icon: Cpu,
      label: "Bandwidth",
      value: stats ? `${stats.bandwidth.used_mb} / ${stats.bandwidth.limit_mb === -1 ? "∞" : stats.bandwidth.limit_mb} MB` : "—",
      percent: stats?.bandwidth.percent ?? 0,
    },
    {
      icon: Database,
      label: "Databases",
      value: stats ? `${stats.databases.count} / ${stats.databases.limit === -1 ? "∞" : stats.databases.limit}` : "—",
      percent: stats ? (stats.databases.limit > 0 ? (stats.databases.count / stats.databases.limit) * 100 : 0) : 0,
    },
    {
      icon: Mail,
      label: "Email Accounts",
      value: stats ? `${stats.email.count} / ${stats.email.limit === -1 ? "∞" : stats.email.limit}` : "—",
      percent: stats ? (stats.email.limit > 0 ? (stats.email.count / stats.email.limit) * 100 : 0) : 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{panelLabel} Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.plan_name ?? "Hosting"} Plan • {domain}
            {stats?.expires_at && (
              <span> • Expires {new Date(stats.expires_at).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIframe(!showIframe)}
            className="rounded-sm"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {showIframe ? "Hide Panel" : "Embedded View"}
          </Button>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm"
            onClick={handleOpenPanel}
            disabled={ssoLoading}
          >
            {ssoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
            Open {panelLabel}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cpanelStats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl bg-card border card-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-sm font-heading font-bold">{stat.value}</div>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(stat.percent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-card border card-shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold">Quick Actions</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} /> Refresh Stats
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={handleOpenPanel}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors group"
            >
              <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Embedded panel iframe via SSO */}
      {showIframe && (
        <div className="rounded-xl bg-card border card-shadow overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm">{panelLabel} — Embedded View</h2>
            <span className="text-[10px] text-muted-foreground">
              If the panel doesn't load, use the "Open {panelLabel}" button instead
            </span>
          </div>
          <div className="w-full flex items-center justify-center p-10 text-muted-foreground text-sm">
            <p>For security, use the <strong>"Open {panelLabel}"</strong> button above. SSO auto-login opens in a new tab.</p>
          </div>
        </div>
      )}
    </div>
  );
}
