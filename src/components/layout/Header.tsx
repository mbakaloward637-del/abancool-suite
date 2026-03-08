import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Globe, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currencies = [
  { code: "KES", symbol: "KSh", label: "KES (KSh)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Services",
    path: "/services",
    children: [
      { label: "Web Development", path: "/services/web-development" },
      { label: "Software Development", path: "/services/software-development" },
      { label: "School Management", path: "/services/school-management" },
      { label: "Bulk SMS", path: "/services/bulk-sms" },
      { label: "Payment Integration", path: "/services/payment-integration" },
    ],
  },
  { label: "Hosting", path: "/hosting" },
  { label: "Domains", path: "/domains" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState(currencies[0]);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div className="bg-hero text-hero-foreground/70 text-xs hidden lg:block">
        <div className="container-max flex items-center justify-between h-10 px-4 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> 0728825152</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> info@abancool.com</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-hero-foreground transition-colors">
                  <Globe className="w-3 h-3" /> {currency.code}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currencies.map((c) => (
                  <DropdownMenuItem key={c.code} onClick={() => setCurrency(c)}>{c.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/client/login" className="hover:text-hero-foreground transition-colors">Client Area</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/98 backdrop-blur-md shadow-md" : "bg-card"}`}>
        <div className="container-max flex items-center justify-between h-[72px] px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                <span className="text-accent-foreground font-heading font-extrabold text-lg">A</span>
              </div>
            </div>
            <div className="leading-tight">
              <span className="font-heading font-bold text-lg text-foreground block">ABANCOOL</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Technology</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${isActive(link.path) ? "text-accent" : "text-foreground hover:text-accent"}`}>
                      {link.label} <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[200px]">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.path} asChild>
                        <Link to={child.path} className="font-medium">{child.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${isActive(link.path) ? "text-accent" : "text-foreground hover:text-accent"}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden lg:block">
            <Link to="/contact">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-xs tracking-wider px-6 h-11 rounded-sm">
                Get a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-card p-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  to={link.path}
                  className="block px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children?.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className="block px-8 py-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-3 flex gap-2">
              <Link to="/client/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Client Login</Button>
              </Link>
              <Link to="/contact" className="flex-1">
                <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Get a Quote</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
