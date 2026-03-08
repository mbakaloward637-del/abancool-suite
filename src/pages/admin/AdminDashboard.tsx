import { Users, Server, Globe, FileText, CreditCard, Headphones } from "lucide-react";

const stats = [
  { icon: Users, label: "Total Clients", value: "152" },
  { icon: Server, label: "Hosting Services", value: "89" },
  { icon: Globe, label: "Active Domains", value: "234" },
  { icon: FileText, label: "Open Invoices", value: "23" },
  { icon: CreditCard, label: "Revenue (Month)", value: "KSh 450,000" },
  { icon: Headphones, label: "Open Tickets", value: "8" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-xl bg-card border card-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-heading font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border card-shadow p-6">
        <h2 className="font-heading font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex justify-between py-2 border-b">
            <span>New client registration: Jane Wanjiku</span>
            <span>2 hours ago</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Invoice INV-156 paid via M-Pesa</span>
            <span>4 hours ago</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Support ticket TKT-089 opened</span>
            <span>6 hours ago</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Domain startup.africa renewed</span>
            <span>1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
