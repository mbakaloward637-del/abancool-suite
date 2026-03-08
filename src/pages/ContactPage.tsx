import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import datacenter from "@/assets/hero-datacenter.jpg";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you shortly." });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={datacenter} alt="Infrastructure" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">Get In Touch</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            Contact <span className="text-accent">Us</span>
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">
            Get in touch with our team for inquiries, quotes, or support.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max grid lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-label">Contact Info</span>
            <h2 className="font-heading text-3xl font-bold mb-8">Get in <span className="text-accent">Touch</span></h2>
            <div className="space-y-6 mb-10">
              {[
                { icon: Phone, label: "Phone", value: "0728825152" },
                { icon: Mail, label: "Email", value: "info@abancool.com" },
                { icon: MapPin, label: "Location", value: "Garissa, Kenya" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-accent/10 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</div>
                    <div className="font-heading font-semibold">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-sm overflow-hidden border h-64 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Google Maps — Garissa, Kenya
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-card border card-shadow space-y-5 rounded-sm"
          >
            <span className="section-label">Send a Message</span>
            <h2 className="font-heading text-2xl font-bold mb-2">Write to <span className="text-accent">Us</span></h2>
            <Input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-sm h-12" />
            <Input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-sm h-12" />
            <Input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-sm h-12" />
            <Textarea placeholder="Your Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="rounded-sm" />
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 rounded-sm font-semibold uppercase text-xs tracking-wider">
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </motion.form>
        </div>
      </section>
    </>
  );
}
