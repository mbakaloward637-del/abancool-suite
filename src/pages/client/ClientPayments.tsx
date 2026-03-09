import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Loader2, Smartphone, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://api.abancool.com";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session?.access_token ?? ""}`,
    "Content-Type": "application/json",
  };
}

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

  // Poll invoice status after M-Pesa STK push
  const startPolling = (invoiceId: string) => {
    setPolling(invoiceId);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      const { data } = await supabase.from("invoices").select("status").eq("id", invoiceId).maybeSingle();
      if (data?.status === "paid") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(null);
        toast({ title: "Payment Confirmed!", description: "Your hosting is being activated." });
        loadData();
      } else if (attempts >= 24) {
        // Stop after 2 minutes
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
        toast({
          title: "STK Push Sent",
          description: "Check your phone for the M-Pesa payment prompt.",
        });
        setPayingInvoice(null);
        startPolling(invoice.id);
      } else {
        toast({ title: "Payment Failed", description: data.error || "Try again.", variant: "destructive" });
      }
    } catch (err) {
      console.error("M-Pesa request failed:", err);
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
        // In a full implementation, use Stripe.js confirmCardPayment here
        toast({
          title: "Stripe Ready",
          description: "Card payment form would appear here. Integration requires Stripe.js on frontend.",
        });
      } else {
        toast({ title: "Payment Failed", description: data.error || "Try again.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Stripe request failed:", err);
      toast({ title: "Error", description: "Could not reach payment server.", variant: "destructive" });
    } finally {
      setProcessing(false);
      setPayingInvoice(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Payments</h1>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Smartphone, label: "M-Pesa", desc: "Instant via STK Push" },
          { icon: CreditCard, label: "Card Payment", desc: "Visa / Mastercard" },
          { icon: Globe, label: "Bank Transfer", desc: "Direct deposit" },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-card border card-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <m.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-xs text-muted-foreground">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="rounded-xl bg-card border card-shadow">
          <div className="p-5 border-b">
            <h2 className="font-heading font-semibold">Unpaid Invoices — Pay Now</h2>
          </div>
          <div className="divide-y">
            {unpaidInvoices.map((inv: any) => (
              <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{inv.invoice_number}</div>
                  <div className="text-sm text-muted-foreground">{inv.service_description || inv.service_type}</div>
                  {polling === inv.id && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-accent">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Waiting for M-Pesa confirmation...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold text-accent">KSh {Number(inv.amount).toLocaleString()}</span>
                  {payingInvoice?.id === inv.id ? (
                    <div className="space-y-2">
                      {/* Method selector */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPaymentMethod("mpesa")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${paymentMethod === "mpesa" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          M-Pesa
                        </button>
                        <button
                          onClick={() => setPaymentMethod("card")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${paymentMethod === "card" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          Card
                        </button>
                      </div>
                      {paymentMethod === "mpesa" ? (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="0712345678"
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-36 h-9 text-sm rounded-sm"
                          />
                          <Button size="sm" disabled={processing} onClick={() => handleMpesaPay(inv)}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-9">
                            {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send STK"}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" disabled={processing} onClick={() => handleStripePay(inv)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-9">
                          {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pay with Card"}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setPayingInvoice(null)} className="text-xs h-9">Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => { setPayingInvoice(inv); setPaymentMethod("mpesa"); }}
                      disabled={polling === inv.id}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
                      {polling === inv.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-xl bg-card border card-shadow overflow-x-auto">
        <div className="p-5 border-b">
          <h2 className="font-heading font-semibold">Payment History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Reference</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No payments yet</td></tr>
            ) : payments.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{p.mpesa_receipt || p.reference || "—"}</td>
                <td className="p-3 capitalize">{p.method}</td>
                <td className="p-3 font-medium">KSh {Number(p.amount).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "completed" ? "bg-green-100 text-green-700" :
                    p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {p.status === "completed" && <CheckCircle className="w-3 h-3" />}
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
