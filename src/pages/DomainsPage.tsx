import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe } from "lucide-react";
import datacenter from "@/assets/hero-datacenter.jpg";

const extensions = [
  { ext: ".com", price: "1,500" },
  { ext: ".net", price: "1,600" },
  { ext: ".org", price: "1,500" },
  { ext: ".co.ke", price: "1,200" },
  { ext: ".africa", price: "2,200" },
  { ext: ".tech", price: "2,000" },
];

export default function DomainsPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={datacenter} alt="Infrastructure" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/80" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20 text-center">
          <span className="section-label justify-center !text-accent">Domain Registration</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight mb-4">
            Find Your Perfect <span className="text-accent">Domain</span>
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-xl mx-auto mb-8">
            Establish your online presence with a professional domain name.
          </p>
          <div className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search your domain name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 bg-card text-foreground rounded-sm"
              />
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-12 rounded-sm font-semibold uppercase text-xs tracking-wider">
              Search
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label justify-center">Pricing</span>
            <h2 className="font-heading text-3xl font-bold">Domain <span className="text-accent">Pricing</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border border-border">
            {extensions.map((d, i) => (
              <motion.div
                key={d.ext}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 border-r border-b last:border-r-0 bg-card text-center group hover:bg-accent transition-colors duration-500"
              >
                <Globe className="w-8 h-8 text-accent mx-auto mb-3 group-hover:text-accent-foreground transition-colors duration-500" />
                <div className="font-heading font-bold text-lg mb-1 group-hover:text-accent-foreground transition-colors duration-500">{d.ext}</div>
                <div className="text-accent font-semibold group-hover:text-accent-foreground transition-colors duration-500">KSh {d.price}</div>
                <div className="text-xs text-muted-foreground group-hover:text-accent-foreground/70 transition-colors duration-500">/year</div>
                <Button size="sm" variant="outline" className="mt-3 w-full text-xs rounded-sm group-hover:bg-accent-foreground group-hover:text-accent group-hover:border-accent-foreground transition-colors duration-500">
                  Register
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
