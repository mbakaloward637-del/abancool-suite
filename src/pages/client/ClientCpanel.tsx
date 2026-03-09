import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, Monitor, HardDrive, Mail, Database, Cpu, Activity,
  RefreshCw, Lock, ShoppingCart, Loader2, Shield, Gauge, Globe,
  ArrowUpRight, Zap, Server
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE = "https://api.abancool.com";

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const quickActions = [
  { label: "File Manager", icon: HardDrive, desc: "Browse & manage files", path: "filemanager" },
  { label: "Email Accounts", icon: Mail, desc: "Create & manage emails", path: "email" },
  { label: "Databases", icon: Database, desc: "MySQL / PostgreSQL", path: "databases" },
  { label: "SSL/TLS", icon: Shield, desc: "Manage certificates", path: "ssl" },
  { label: "Resource Usage", icon: Activity, desc: "CPU, RAM, I/O stats", path: "resource_usage" },
  { label: "Domains", icon: Globe, desc: "Addon & parked domains", path: "addon_domains" },
];

export default function ClientCpanel() {
  const [hasHosting, setHasHosting] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PanelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [domain, setDomain] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const statusRes = await fetch(`${API_BASE}/api/cpanel/status`, { headers });
      const statusData = await statusRes.json();

      if (!statusData.has_hosting) {
        setHasHosting(false);
        setLoading(false);
        return;
      }

      setHasHosting(true);
      setDomain(statusData.domain || "No domain set");

      const statsRes = await fetch(`${API_BASE}/api/cpanel/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData) setStats(statsData);
    } catch {
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
      if (data.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("SSO request failed:", err);
    } finally {
      setSsoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
          <Server className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>
    );
  }

  // Paywall
  if (!hasHosting) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold">cPanel Management</h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-card border border-border/50 p-12 text-center space-y-5 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
          </div>

          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto ring-4 ring-muted/30">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-bold mt-6">Hosting Required</h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              Purchase a hosting plan to unlock your cPanel control panel. Your account will be provisioned automatically after payment confirmation.
            </p>
            <Link to="/client/dashboard/hosting">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 mt-6 rounded-xl px-8 shadow-lg hover:shadow-xl transition-shadow">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Hosting Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const panelLabel = stats?.panel_type === "directadmin" ? "DirectAdmin" : "cPanel";

  const statCards = [
    {
      icon: HardDrive,
      label: "Disk Space",
      value: stats ? `${stats.disk.used_mb} MB` : "—",
      max: stats ? `${stats.disk.limit_mb === -1 ? "∞" : stats.disk.limit_mb + " MB"}` : "—",
      percent: stats?.disk.percent ?? 0,
      gradient: "from-blue-500 to-cyan-500",
      glow: "bg-blue-500/10",
    },
    {
      icon: Gauge,
      label: "Bandwidth",
      value: stats ? `${stats.bandwidth.used_mb} MB` : "—",
      max: stats ? `${stats.bandwidth.limit_mb === -1 ? "∞" : stats.bandwidth.limit_mb + " MB"}` : "—",
      percent: stats?.bandwidth.percent ?? 0,
      gradient: "from-violet-500 to-purple-500",
      glow: "bg-violet-500/10",
    },
    {
      icon: Database,
      label: "Databases",
      value: stats ? `${stats.databases.count}` : "—",
      max: stats ? `${stats.databases.limit === -1 ? "∞" : stats.databases.limit}` : "—",
      percent: stats ? (stats.databases.limit > 0 ? (stats.databases.count / stats.databases.limit) * 100 : 0) : 0,
      gradient: "from-emerald-500 to-teal-500",
      glow: "bg-emerald-500/10",
    },
    {
      icon: Mail,
      label: "Email Accounts",
      value: stats ? `${stats.email.count}` : "—",
      max: stats ? `${stats.email.limit === -1 ? "∞" : stats.email.limit}` : "—",
      percent: stats ? (stats.email.limit > 0 ? (stats.email.count / stats.email.limit) * 100 : 0) : 0,
      gradient: "from-amber-500 to-orange-500",
      glow: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{panelLabel} Management</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {stats?.plan_name ?? "Hosting"} Plan • {domain}
            {stats?.expires_at && (
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-muted">
                Expires {new Date(stats.expires_at).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground border-0 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleOpenPanel}
            disabled={ssoLoading}
          >
            {ssoLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ExternalLink className="w-5 h-5 mr-2" />}
            Open {panelLabel}
          </Button>
        </div>
      </div>

      {/* Resource Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 hover-lift"
          >
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.glow} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.glow} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: 'inherit' }} />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{stat.max}</span>
              </div>
              <div className="text-2xl font-heading font-bold tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              
              {/* Progress bar */}
              <div className="mt-4 w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stat.percent, 100)}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 text-right">{stat.percent.toFixed(1)}%</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl bg-card border border-border/50 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">Quick Actions</h2>
              <p className="text-xs text-muted-foreground">Access common {panelLabel} features</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              onClick={handleOpenPanel}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold group-hover:text-foreground transition-colors">{action.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{action.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/30 p-6 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Monitor className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Auto-Login Enabled</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click "Open {panelLabel}" to be automatically logged into your control panel — no username or password needed.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenPanel} className="rounded-lg shrink-0 hidden sm:flex">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          Launch
        </Button>
      </motion.div>
    </div>
  );
}
