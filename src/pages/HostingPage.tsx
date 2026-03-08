import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import datacenter from "@/assets/hero-datacenter.jpg";

const plans = [
  {
    name: "Starter",
    price: "3,000",
    features: ["5GB SSD Storage", "20GB Bandwidth", "Free SSL Certificate", "5 Email Accounts", "1 Website", "cPanel Access", "Weekly Backups"],
  },
  {
    name: "Business",
    price: "6,000",
    popular: true,
    features: ["20GB SSD Storage", "Unlimited Bandwidth", "Free SSL Certificate", "Unlimited Email Accounts", "5 Websites", "cPanel Access", "Daily Backups"],
  },
  {
    name: "Professional",
    price: "12,000",
    features: ["50GB SSD Storage", "Unlimited Bandwidth", "Free SSL Certificate", "Unlimited Email Accounts", "10 Websites", "cPanel Access", "Daily Backups", "Staging Environment"],
  },
  {
    name: "Enterprise",
    price: "25,000",
    features: ["100GB SSD Storage", "Unlimited Bandwidth", "Free SSL Certificate", "Unlimited Email Accounts", "Unlimited Websites", "cPanel Access", "Real-time Backups", "Priority Support", "Dedicated IP"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HostingPage() {
  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={datacenter} alt="Data center" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">Web Hosting</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            Hosting <span className="text-accent">Plans</span>
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">
            Fast, secure, and reliable SSD hosting with 99.9% uptime. Starting from KSh 3,000/year.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`p-8 border-r last:border-r-0 flex flex-col ${plan.popular ? "bg-hero text-hero-foreground relative" : "bg-card"}`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                    Popular
                  </span>
                )}
                <h3 className="font-heading font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-heading font-bold text-accent">KSh {plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-hero-foreground/60" : "text-muted-foreground"}`}>/year</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-hero-foreground/80" : "text-muted-foreground"}`}>
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm font-semibold uppercase text-xs tracking-wider">
                  Order Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
