import { motion } from "framer-motion";
import aboutCoding from "@/assets/about-coding.jpg";
import aboutServers from "@/assets/about-servers.jpg";
import datacenter from "@/assets/hero-datacenter.jpg";
import heroImg from "@/assets/hero-developers.jpg";

const projects = [
  { title: "School Management System", category: "Education", desc: "Complete student, fees, and results management for secondary schools.", tech: ["React", "Node.js", "PostgreSQL"], img: aboutCoding },
  { title: "Corporate Website", category: "Web Development", desc: "Modern responsive website for a logistics company in Nairobi.", tech: ["React", "TailwindCSS"], img: datacenter },
  { title: "M-Pesa Payment Gateway", category: "Payment Integration", desc: "Custom M-Pesa STK push integration for an e-commerce platform.", tech: ["Node.js", "Daraja API"], img: aboutServers },
  { title: "Bulk SMS Platform", category: "Communication", desc: "Marketing and OTP SMS platform serving 50,000+ messages monthly.", tech: ["React", "Python", "Redis"], img: heroImg },
  { title: "Hospital Records System", category: "Healthcare", desc: "Patient records and appointment management system.", tech: ["React", "Django", "MySQL"], img: aboutCoding },
  { title: "E-Commerce Store", category: "Web Development", desc: "Online store with M-Pesa and PayPal payment integration.", tech: ["React", "Stripe", "M-Pesa"], img: datacenter },
];

export default function PortfolioPage() {
  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">Our Work</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            Our <span className="text-accent">Portfolio</span>
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">Selected projects showcasing our expertise.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="project-card h-72 rounded-sm"
              >
                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700" />
                <div className="project-overlay rounded-sm">
                  <span className="text-accent text-xs font-bold uppercase tracking-wider">{p.category}</span>
                  <h3 className="font-heading font-bold text-hero-foreground text-lg mt-1">{p.title}</h3>
                  <p className="text-hero-foreground/60 text-sm mt-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-sm text-[10px] bg-accent/20 text-accent font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
