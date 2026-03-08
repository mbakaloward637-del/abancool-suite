import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Headphones, Loader2, Plus, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({ department: "technical", subject: "", message: "" });
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  async function loadReplies(ticketId: string) {
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at");
    setReplies(data || []);
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSubmitting(true);
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    const { data: ticket, error } = await supabase.from("support_tickets").insert({
      ticket_number: ticketNumber, user_id: user.id, department: newTicket.department, subject: newTicket.subject,
    }).select().single();
    if (ticket) {
      await supabase.from("ticket_replies").insert({ ticket_id: ticket.id, user_id: user.id, message: newTicket.message });
    }
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Ticket created", description: `Ticket ${ticketNumber} submitted.` }); setShowNew(false); setNewTicket({ department: "technical", subject: "", message: "" }); loadTickets(); }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedTicket) return;
    setSubmitting(true);
    await supabase.from("ticket_replies").insert({ ticket_id: selectedTicket.id, user_id: user.id, message: replyMsg });
    setReplyMsg(""); setSubmitting(false); loadReplies(selectedTicket.id);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedTicket(null); setReplies([]); }} className="text-sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <div className="rounded-xl bg-card border card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-lg">{selectedTicket.subject}</h2>
              <p className="text-sm text-muted-foreground">{selectedTicket.ticket_number} • {selectedTicket.department} • {selectedTicket.status}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTicket.status === "open" ? "bg-green-100 text-green-700" : selectedTicket.status === "closed" ? "bg-muted text-muted-foreground" : "bg-yellow-100 text-yellow-700"}`}>{selectedTicket.status}</span>
          </div>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {replies.map((r: any) => (
              <div key={r.id} className={`p-3 rounded-lg text-sm ${r.is_staff ? "bg-accent/10 border-l-2 border-accent" : "bg-muted/30"}`}>
                <div className="text-xs text-muted-foreground mb-1">{r.is_staff ? "Staff" : "You"} • {new Date(r.created_at).toLocaleString()}</div>
                <p>{r.message}</p>
              </div>
            ))}
          </div>
          {selectedTicket.status !== "closed" && (
            <form onSubmit={handleReply} className="flex gap-2">
              <Input value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Type your reply..." className="flex-1 rounded-sm" required />
              <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90"><Send className="w-4 h-4" /></Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (showNew) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setShowNew(false)} className="text-sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <div className="rounded-xl bg-card border card-shadow p-6 max-w-xl">
          <h2 className="font-heading font-bold text-lg mb-4">New Support Ticket</h2>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              <select value={newTicket.department} onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })} className="w-full h-10 px-3 rounded-sm border bg-background text-sm">
                <option value="technical">Technical</option><option value="billing">Billing</option><option value="sales">Sales</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label><Input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} required className="rounded-sm" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label><Textarea value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} required rows={5} className="rounded-sm" /></div>
            <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">{submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Submit Ticket</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Support Tickets</h1>
        <Button onClick={() => setShowNew(true)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="w-4 h-4 mr-2" /> New Ticket</Button>
      </div>
      {tickets.length === 0 ? (
        <div className="rounded-xl bg-card border card-shadow p-10 text-center space-y-4">
          <Headphones className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="font-heading text-xl font-semibold">No Support Tickets</h2>
          <p className="text-muted-foreground">Need help? Create a support ticket.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card border card-shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Ticket</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Subject</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr key={t.id} className="border-b last:border-0 cursor-pointer hover:bg-muted/30" onClick={() => { setSelectedTicket(t); loadReplies(t.id); }}>
                  <td className="p-3 font-medium">{t.ticket_number}</td>
                  <td className="p-3">{t.subject}</td>
                  <td className="p-3 capitalize">{t.department}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "open" ? "bg-green-100 text-green-700" : t.status === "closed" ? "bg-muted text-muted-foreground" : "bg-yellow-100 text-yellow-700"}`}>{t.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
