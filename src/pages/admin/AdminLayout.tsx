import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Server, Globe, FileText, CreditCard, Headphones, Settings, LogOut } from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Clients", path: "/admin/clients" },
  { icon: Server, label: "Hosting", path: "/admin/hosting" },
  { icon: Globe, label: "Domains", path: "/admin/domains" },
  { icon: FileText, label: "Invoices", path: "/admin/invoices" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Headphones, label: "Support", path: "/admin/support" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-section-alt">
      <aside className="w-64 bg-hero text-hero-foreground flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-4 border-b border-hero-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">A</span>
            </div>
            <div>
              <span className="font-heading font-bold block text-sm">Abancool</span>
              <span className="text-xs opacity-50">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-hero-foreground/70 hover:text-hero-foreground hover:bg-hero-foreground/5"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-hero-foreground/10">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-hero-foreground/70 hover:text-hero-foreground hover:bg-hero-foreground/5">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b flex items-center px-6">
          <h2 className="font-heading font-semibold">Admin Panel</h2>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
