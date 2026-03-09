import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, ShoppingCart, Zap, Loader2, Crown, Rocket, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface HostingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  disk_space_gb: number;
  bandwidth_gb: number;
  email_accounts: number;
  databases: number;
  features: string[];
}

interface HostingOrder {
  id: string;
  plan_id: string;
  domain: string | null;
  status: string;
  billing_cycle: string;
  amount_paid: number;
  expires_at: string | null;
  created_at: string;
  hosting_plans: { name: string } | null;
}

const planIcons = [Star, Rocket, Crown, Zap];
const planGradients = [
  "from-blue-500/10 to-cyan-500/10",
  "from-violet-500/10 to-purple-500/10",
  "from-amber-500/10 to-orange-500/10",
  "from-emerald-500/10 to-teal-500/10",
];
const planBorders = [
  "hover:border-blue-300",
  "hover:border-violet-300",
  "hover:border-amber-300",
  "hover:border-emerald-300",
];
const planAccents = [
  "text-blue-500",
  "text-violet-500",
  "text-amber-500",
  "text-emerald-500",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

export default function ClientHosting() {
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [orders, setOrders] = useState<HostingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [plansRes, ordersRes] = await Promise.all([
        supabase.from("hosting_plans").select("*").eq("is_active", true).order("price_monthly"),
        supabase.from("hosting_orders")
          .select("id, plan_id, domain, status, billing_cycle, amount_paid, expires_at, created_at, hosting_plans(name)")
          .order("created_at", { ascending: false }),
      ]);
      setPlans((plansRes.data || []) as HostingPlan[]);
      setOrders((ordersRes.data || []) as HostingOrder[]);
      setLoading(false);
    }
    load();
  }, []);

  const handlePurchase = async (plan: HostingPlan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setPurchasing(plan.id);
    const price = billingCycle === "monthly" ? plan.price_monthly : (plan.price_yearly || plan.price_monthly * 10);
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    await supabase.from("hosting_orders").insert({
      user_id: user.id,
      plan_id: plan.id,
      billing_cycle: billingCycle,
      amount_paid: 0,
      status: "pending",
    });

    await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      user_id: user.id,
      service_type: "hosting",
      service_description: `${plan.name} Hosting Plan (${billingCycle})`,
      amount: price,
      status: "unpaid",
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setPurchasing(null);
    toast({ title: "Order created! 🎉", description: "Redirecting to payment..." });
    navigate("/client/dashboard/payments");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold">Hosting Services</h1>
        <p className="text-muted-foreground mt-1">
          High-performance NVMe SSD hosting with LiteSpeed & cPanel. Auto-activated after payment.
        </p>
      </div>

      {/* Active Orders */}
      {orders.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Your Hosting
          </h2>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl bg-card border border-border/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover-lift"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  order.status === "active" ? "bg-emerald-500/10" : "bg-amber-500/10"
                }`}>
                  <Rocket className={`w-6 h-6 ${order.status === "active" ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <div>
                  <h3 className="font-heading font-bold">{order.hosting_plans?.name || "Hosting"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.domain || "No domain"} • {order.billing_cycle}
                    {order.expires_at && ` • Expires ${new Date(order.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold w-fit border ${
                order.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                order.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                "bg-red-500/10 text-red-600 border-red-200"
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-muted/50 rounded-2xl p-1.5 border border-border/50">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              billingCycle === "monthly" ? "bg-card shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              billingCycle === "yearly" ? "bg-card shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">SAVE 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, i) => {
          const isPopular = i === 2;
          const price = billingCycle === "monthly" ? plan.price_monthly : (plan.price_yearly || plan.price_monthly * 10);
          const features = Array.isArray(plan.features) ? plan.features : [];
          const PlanIcon = planIcons[i % planIcons.length];

          return (
            <motion.div
              key={plan.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={`group relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                isPopular
                  ? "border-accent bg-gradient-to-b from-accent/5 to-transparent shadow-lg shadow-accent/10 scale-[1.02]"
                  : `bg-card border-border/50 ${planBorders[i % planBorders.length]} hover-lift`
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <Crown className="w-3.5 h-3.5" /> Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${planGradients[i % planGradients.length]} flex items-center justify-center mb-5 ring-1 ring-border/30`}>
                <PlanIcon className={`w-7 h-7 ${planAccents[i % planAccents.length]}`} />
              </div>

              <h3 className="font-heading font-bold text-xl">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-5 leading-relaxed">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold tracking-tight">KSh {price.toLocaleString()}</span>
                </div>
                <span className="text-sm text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
              </div>

              {/* Resources summary */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { label: "Disk", value: `${plan.disk_space_gb}GB NVMe` },
                  { label: "BW", value: `${plan.bandwidth_gb}GB` },
                  { label: "Emails", value: plan.email_accounts === 0 ? "∞" : String(plan.email_accounts) },
                  { label: "DBs", value: plan.databases === 0 ? "∞" : String(plan.databases) },
                ].map((r) => (
                  <div key={r.label} className="px-3 py-2 rounded-lg bg-muted/40 text-center">
                    <div className="text-xs font-bold">{r.value}</div>
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-7 flex-1">
                {features.map((f) => (
                  <div key={String(f)} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm leading-snug">{String(f)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={() => handlePurchase(plan)}
                disabled={purchasing === plan.id}
                size="lg"
                className={`w-full rounded-xl font-semibold ${
                  isPopular
                    ? "gradient-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border/50"
                } transition-all`}
              >
                {purchasing === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Get Started
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
