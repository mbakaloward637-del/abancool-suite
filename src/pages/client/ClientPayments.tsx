import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard, Loader2, Smartphone, Globe, CheckCircle2, Clock,
  AlertCircle, ArrowUpRight, Receipt, Banknote, Shield, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const API_BASE = "https://api.abancool.com";

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

export default function ClientPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [polling, setPolling] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    const [paymentsRes, invoicesRes] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").in("status", ["unpaid", "overdue"]).order("due_at"),
    ]);
    setPayments(paymentsRes.data || []);
    setUnpaidInvoices(invoicesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = (invoiceId: string) => {
    setPolling(invoiceId);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      const { data } = await supabase.from("invoices").select("status").eq("id", invoiceId).maybeSingle();
      if (data?.status === "paid") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(null);
        toast({ title: "Payment Confirmed! ✅", description: "Your hosting is being activated." });
        loadData();
      } else if (attempts >= 24) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(null);
      }
    }, 5000);
  };

  const handleMpesaPay = async (invoice: any) => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast({ title: "Invalid phone", description: "Enter a valid M-Pesa phone number.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/payments/mpesa`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invoice_id: invoice.id, phone: mpesaPhone }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "STK Push Sent 📲", description: "Check your phone for the M-Pesa payment prompt." });
        setPayingInvoice(null);
        startPolling(invoice.id);
      } else {
        toast({ title: "Payment Failed", description: data.error || "Try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not reach payment server.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePay = async (invoice: any) => {
    setProcessing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/payments/stripe/intent`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      const data = await res.json();

      if (data.client_secret) {
        toast({ title: "Stripe Ready", description: "Card payment form loading..." });
      } else {
        toast({ title: "Payment Failed", description: data.error || "Try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not reach payment server.", variant: "destructive" });
    } finally {
      setProcessing(false);
      setPayingInvoice(null);
    }
  };

  const totalPaid = payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = unpaidInvoices.reduce((s, i) => s + Number(i.amount), 0);

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
        <h1 className="font-heading text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Manage your invoices and payment methods.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total Paid", value: `KSh ${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", glow: "bg-emerald-500/10", desc: `${payments.filter(p => p.status === "completed").length} transactions` },
          { label: "Pending", value: `KSh ${totalPending.toLocaleString()}`, icon: Clock, color: "text-amber-500", glow: "bg-amber-500/10", desc: `${unpaidInvoices.length} invoices` },
          { label: "Payment Methods", value: "3 Active", icon: CreditCard, color: "text-primary", glow: "bg-primary/10", desc: "M-Pesa, Card, Bank" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 hover-lift"
          >
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${card.glow} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity`} />
            <div className="relative">
              <div className={`w-11 h-11 rounded-xl ${card.glow} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-heading font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-1">{card.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-card border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold">Payment Methods</h2>
            <p className="text-xs text-muted-foreground">Secure payment options available</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Smartphone, label: "M-Pesa", desc: "Instant STK Push", badge: "Popular", color: "border-emerald-200 hover:border-emerald-400", badgeColor: "bg-emerald-500/10 text-emerald-600" },
            { icon: CreditCard, label: "Card Payment", desc: "Visa / Mastercard", badge: "Secure", color: "border-blue-200 hover:border-blue-400", badgeColor: "bg-blue-500/10 text-blue-600" },
            { icon: Globe, label: "Bank Transfer", desc: "Direct deposit", badge: "Manual", color: "border-amber-200 hover:border-amber-400", badgeColor: "bg-amber-500/10 text-amber-600" },
          ].map((m) => (
            <div key={m.label} className={`p-5 rounded-xl bg-card border ${m.color} transition-colors flex items-start gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                <m.icon className="w-6 h-6 text-foreground/70" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{m.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.badgeColor}`}>{m.badge}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-amber-200/50 overflow-hidden"
        >
          <div className="p-6 border-b border-border/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">Outstanding Invoices</h2>
              <p className="text-xs text-muted-foreground">Pay now to activate your services</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
                {unpaidInvoices.length} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {unpaidInvoices.map((inv: any) => (
              <div key={inv.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{inv.invoice_number}</div>
                      <div className="text-xs text-muted-foreground">{inv.service_description || inv.service_type}</div>
                      {polling === inv.id && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                          <span className="text-xs text-amber-600 font-medium">Waiting for M-Pesa confirmation...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-heading font-bold text-accent">KSh {Number(inv.amount).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">Due {new Date(inv.due_at).toLocaleDateString()}</div>
                    </div>

                    {payingInvoice?.id === inv.id ? (
                      <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50 min-w-[280px]">
                        {/* Method selector */}
                        <div className="flex rounded-lg overflow-hidden border border-border/50">
                          <button
                            onClick={() => setPaymentMethod("mpesa")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${paymentMethod === "mpesa" ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground hover:bg-muted/50"}`}
                          >
                            <Smartphone className="w-3.5 h-3.5" /> M-Pesa
                          </button>
                          <button
                            onClick={() => setPaymentMethod("card")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${paymentMethod === "card" ? "bg-blue-500 text-white" : "bg-card text-muted-foreground hover:bg-muted/50"}`}
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Card
                          </button>
                        </div>

                        {paymentMethod === "mpesa" ? (
                          <div className="space-y-2">
                            <Input
                              placeholder="0712345678"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              className="h-10 text-sm rounded-lg"
                            />
                            <Button
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg h-10"
                              disabled={processing}
                              onClick={() => handleMpesaPay(inv)}
                            >
                              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                              Send STK Push
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10"
                            disabled={processing}
                            onClick={() => handleStripePay(inv)}
                          >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Pay with Card
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setPayingInvoice(null)} className="w-full text-xs">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => { setPayingInvoice(inv); setPaymentMethod("mpesa"); }}
                        disabled={polling === inv.id}
                        className="gradient-primary text-primary-foreground border-0 rounded-xl px-6 shadow-md hover:shadow-lg transition-shadow"
                      >
                        {polling === inv.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-card border border-border/50 overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold">Payment History</h2>
            <p className="text-xs text-muted-foreground">All your transactions</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Reference</th>
                <th className="text-left p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="text-left p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-muted-foreground">No payments yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Payments will appear here after you make a transaction</p>
                  </td>
                </tr>
              ) : payments.map((p: any) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{p.mpesa_receipt || p.reference || "—"}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {p.method === "mpesa" ? <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> : <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                      <span className="capitalize font-medium text-sm">{p.method}</span>
                    </div>
                  </td>
                  <td className="p-4 font-heading font-bold">KSh {Number(p.amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      p.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                      p.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                      "bg-red-500/10 text-red-600 border-red-200"
                    }`}>
                      {p.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> :
                       p.status === "pending" ? <Clock className="w-3 h-3" /> :
                       <AlertCircle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
