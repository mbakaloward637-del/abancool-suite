import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Shield, Zap, Clock, Headphones, Star, Server, Globe, Lock, HardDrive } from "lucide-react";
import datacenter from "@/assets/hero-datacenter.jpg";

const plans = [
  {
    name: "Starter",
    price: "1,500",
    period: "year",
    monthly: "125",
    features: ["1 Website", "30GB NVMe SSD Storage", "10 Email Accounts", "Free SSL Certificate", "LiteSpeed Server", "Website Builder Included", "Softaculous 1-Click Installer", "Weekly Backups", "5 MySQL Databases"],
  },
  {
    name: "Business",
    price: "2,500",
    period: "year",
    monthly: "209",
    popular: true,
    features: ["5 Websites", "60GB NVMe SSD Storage", "15 Email Accounts", "Free SSL Certificate", "LiteSpeed Server", "Website Builder Included", "Softaculous 1-Click Installer", "Daily Backups", "10 MySQL Databases"],
  },
  {
    name: "Premium",
    price: "4,000",
    period: "year",
    monthly: "334",
    features: ["Unlimited Websites", "80GB NVMe SSD Storage", "Unlimited Email Accounts", "Free SSL Certificates", "LiteSpeed Server", "Website Builder Included", "Softaculous 1-Click Installer", "Daily Backups", "Unlimited Databases"],
  },
  {
    name: "Enterprise",
    price: "6,000",
    period: "year",
    monthly: "500",
    features: ["Unlimited Websites", "Unlimited NVMe SSD Storage", "Unlimited Email Accounts", "Unlimited Databases", "Free SSL Certificates", "LiteSpeed Server", "Website Builder Included", "Softaculous 1-Click Installer", "Daily Backups", "Priority Support"],
  },
];
const features = [
  { icon: Zap, title: "Lightning Fast", desc: "NVMe SSD storage for blazing-fast load times" },
  { icon: Shield, title: "DDoS Protection", desc: "Enterprise-grade security for your websites" },
  { icon: Clock, title: "99.9% Uptime", desc: "Guaranteed uptime with redundant infrastructure" },
  { icon: Headphones, title: "24/7 Support", desc: "Expert support team available around the clock" },
];

const whyUs = [
  { icon: Server, title: "Tier-3 Data Centers", desc: "Hosted in world-class data centers with redundant power and cooling systems for maximum reliability." },
  { icon: Lock, title: "Free SSL & Security", desc: "Every plan includes free Let's Encrypt SSL, firewall protection, and malware scanning." },
  { icon: HardDrive, title: "NVMe SSD Storage", desc: "Up to 10x faster than traditional SSDs. Your websites load instantly with NVMe technology." },
  { icon: Globe, title: "Global CDN", desc: "Content delivery network ensures your website loads fast for visitors worldwide." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HostingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOrderNow = async (plan: typeof plans[0]) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Store selected plan in sessionStorage
    sessionStorage.setItem("selected_hosting_plan", JSON.stringify(plan));
    
    if (!user) {
      toast({ title: "Login required", description: "Please sign in or create an account to order a hosting plan." });
      navigate("/client/login");
      return;
    }

    // User is logged in — create invoice and redirect to payments
    const price = plan.period === "month" 
      ? parseInt(plan.price.replace(/,/g, "")) 
      : parseInt(plan.price.replace(/,/g, ""));
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      user_id: user.id,
      service_type: "hosting",
      service_description: `${plan.name} Hosting Plan (${plan.period}ly)`,
      amount: price,
      status: "unpaid",
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    toast({ title: "Order created!", description: "Redirecting to payment..." });
    navigate("/client/dashboard/payments");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={datacenter} alt="Data center" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/80" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">Web Hosting</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            Premium <span className="text-accent">Hosting</span> Plans
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">
            Fast, secure, and reliable NVMe SSD hosting with LiteSpeed servers and 99.9% uptime. Starting from KSh 1,500/year.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <a href="#plans">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
                View Plans <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="outline" className="border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground/10 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-accent">
        <div className="container-max px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 text-accent-foreground">
                <f.icon className="w-6 h-6 flex-shrink-0" />
                <div>
                  <div className="font-heading font-bold text-sm">{f.title}</div>
                  <div className="text-xs opacity-80">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Choose Your Plan</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Hosting <span className="text-accent">Packages</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">All plans include free setup, cPanel, and 30-day money back guarantee.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`p-6 border-r border-b last:border-r-0 flex flex-col ${plan.popular ? "bg-hero text-hero-foreground relative" : "bg-card"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-0 left-0 right-0">
                    <div className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 text-center flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </div>
                  </div>
                )}
                <div className={plan.popular ? "mt-6" : ""}>
                  <h3 className="font-heading font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-heading font-bold text-accent">KSh {plan.price}</span>
                    <span className={`text-sm ${plan.popular ? "text-hero-foreground/60" : "text-muted-foreground"}`}>/{plan.period}</span>
                  </div>
                  {plan.monthly && (
                    <div className={`text-xs mb-6 ${plan.popular ? "text-hero-foreground/40" : "text-muted-foreground/60"}`}>
                      or KSh {plan.monthly}/month
                    </div>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-hero-foreground/80" : "text-muted-foreground"}`}>
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleOrderNow(plan)}
                  className={`w-full rounded-sm font-semibold uppercase text-xs tracking-wider ${
                  plan.popular
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}>
                  Order Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-section-alt">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Why Abancool Hosting</span>
            <h2 className="font-heading text-3xl font-bold">Built for <span className="text-accent">Performance</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="bg-card border rounded-sm p-6 hover-lift">
                <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Compare</span>
            <h2 className="font-heading text-3xl font-bold">Feature <span className="text-accent">Comparison</span></h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-card border rounded-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-heading font-bold">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className={`p-4 font-heading font-bold text-center ${p.popular ? "bg-accent/10 text-accent" : ""}`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Storage", values: ["30GB NVMe", "60GB NVMe", "80GB NVMe", "Unlimited NVMe"] },
                  { feature: "Websites", values: ["1", "5", "Unlimited", "Unlimited"] },
                  { feature: "Email Accounts", values: ["10", "15", "Unlimited", "Unlimited"] },
                  { feature: "Databases", values: ["5", "10", "Unlimited", "Unlimited"] },
                  { feature: "Free SSL", values: ["✓", "✓", "✓", "✓"] },
                  { feature: "LiteSpeed Server", values: ["✓", "✓", "✓", "✓"] },
                  { feature: "Website Builder", values: ["✓", "✓", "✓", "✓"] },
                  { feature: "Softaculous", values: ["✓", "✓", "✓", "✓"] },
                  { feature: "Daily Backups", values: ["✗", "✓", "✓", "✓"] },
                  { feature: "Priority Support", values: ["✗", "✗", "✗", "✓"] },
                ].map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="p-4 font-medium">{row.feature}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 text-center ${plans[i]?.popular ? "bg-accent/5" : ""} ${v === "✓" ? "text-accent font-bold" : v === "✗" ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-hero" />
        <div className="relative container-max px-4 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-hero-foreground mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-hero-foreground/60 mb-8 max-w-md mx-auto">
            Our team is ready to help you pick the perfect hosting plan for your needs.
          </p>
          <Link to="/contact">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
              Contact Sales <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
