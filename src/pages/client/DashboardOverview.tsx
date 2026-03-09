import { useState, useEffect } from "react";
import { Server, Globe, FileText, CreditCard, ArrowUpRight, TrendingUp, Clock, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

export default function DashboardOverview() {
  const [stats, setStats] = useState({ services: 0, domains: 0, pendingInvoices: 0, totalSpent: 0 });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [ordersRes, domainsRes, invoicesRes, paymentsRes] = await Promise.all([
        supabase.from("hosting_orders").select("id").eq("status", "active"),
        supabase.from("domains").select("id"),
        supabase.from("invoices").select("*").order("issued_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
      ]);

      const unpaid = (invoicesRes.data || []).filter((i: any) => i.status === "unpaid" || i.status === "overdue");
      const completedPayments = (paymentsRes.data || []).filter((p: any) => p.status === "completed");
      const total = completedPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);

      setStats({
        services: ordersRes.data?.length || 0,
        domains: domainsRes.data?.length || 0,
        pendingInvoices: unpaid.length,
        totalSpent: total,
      });
      setRecentInvoices((invoicesRes.data || []).slice(0, 5));
      setRecentPayments((paymentsRes.data || []).slice(0, 3));
      setLoading(false);
    }
    load();
  }, []);

  const widgets = [
    { icon: Server, label: "Active Services", value: loading ? "—" : String(stats.services), trend: "+2 this month", color: "from-primary to-primary/80", bgGlow: "bg-primary/10", iconColor: "text-primary" },
    { icon: Globe, label: "Active Domains", value: loading ? "—" : String(stats.domains), trend: "All healthy", color: "from-emerald-500 to-emerald-600", bgGlow: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    { icon: FileText, label: "Pending Invoices", value: loading ? "—" : String(stats.pendingInvoices), trend: stats.pendingInvoices > 0 ? "Action needed" : "All clear", color: "from-amber-500 to-orange-500", bgGlow: "bg-amber-500/10", iconColor: "text-amber-500" },
    { icon: CreditCard, label: "Total Spent", value: loading ? "—" : `KSh ${stats.totalSpent.toLocaleString()}`, trend: "Lifetime", color: "from-accent to-accent/80", bgGlow: "bg-accent/10", iconColor: "text-accent" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid": return { icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" };
      case "unpaid": return { icon: Clock, class: "bg-amber-500/10 text-amber-600 border-amber-200", dot: "bg-amber-500" };
      default: return { icon: AlertCircle, class: "bg-red-500/10 text-red-600 border-red-200", dot: "bg-red-500" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">Monitor your services, domains, and billing at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {widgets.map((w, i) => (
          <motion.div
            key={w.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 hover-lift cursor-default"
          >
            {/* Glow effect */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${w.bgGlow} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${w.bgGlow} flex items-center justify-center ring-1 ring-border/50`}>
                  <w.icon className={`w-6 h-6 ${w.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>{w.trend}</span>
                </div>
              </div>
              <div className="text-3xl font-heading font-bold tracking-tight">{w.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{w.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Invoices - Takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="xl:col-span-2 rounded-2xl bg-card border border-border/50 overflow-hidden"
        >
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg">Recent Invoices</h2>
                <p className="text-xs text-muted-foreground">Your latest billing activity</p>
              </div>
            </div>
            <Link to="/client/dashboard/invoices" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">No invoices yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Invoices will appear here when you purchase services</p>
              </div>
            ) : recentInvoices.map((inv: any) => {
              const sc = getStatusConfig(inv.status);
              return (
                <div key={inv.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{inv.invoice_number}</div>
                      <div className="text-xs text-muted-foreground truncate">{inv.service_description || inv.service_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-heading font-bold text-sm">KSh {Number(inv.amount).toLocaleString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.class}`}>
                      {inv.status}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(inv.issued_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions + Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: "Manage Hosting", icon: Server, to: "/client/dashboard/hosting", color: "bg-primary/10 text-primary" },
                { label: "Open cPanel", icon: Server, to: "/client/dashboard/cpanel", color: "bg-emerald-500/10 text-emerald-600" },
                { label: "Register Domain", icon: Globe, to: "/client/dashboard/domains", color: "bg-violet-500/10 text-violet-600" },
                { label: "Make Payment", icon: CreditCard, to: "/client/dashboard/payments", color: "bg-accent/10 text-accent" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Recent Payments
              </h3>
              <Link to="/client/dashboard/payments" className="text-xs text-primary hover:text-primary/80 font-medium">
                View All
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">{p.mpesa_receipt || p.reference || "—"}</div>
                      <div className="text-xs text-muted-foreground capitalize">{p.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-heading font-bold">KSh {Number(p.amount).toLocaleString()}</div>
                      <div className={`text-[10px] font-semibold ${p.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                        {p.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
