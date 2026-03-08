import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("invoices").select("*").order("issued_at", { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Invoices</h1>

      {invoices.length === 0 ? (
        <div className="rounded-xl bg-card border card-shadow p-10 text-center space-y-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="font-heading text-xl font-semibold">No Invoices Yet</h2>
          <p className="text-muted-foreground">Invoices will appear here when you purchase hosting or domains.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card border card-shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Service</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{inv.invoice_number}</td>
                  <td className="p-3">{inv.service_description || inv.service_type}</td>
                  <td className="p-3 font-medium">KSh {Number(inv.amount).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === "paid" ? "bg-green-100 text-green-700" :
                      inv.status === "unpaid" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{inv.status}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(inv.due_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {inv.status !== "paid" && (
                      <Button size="sm" onClick={() => navigate("/client/dashboard/payments")} className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-7">
                        Pay Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
