import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Server, GraduationCap, MessageSquare, CreditCard, Globe, Cpu, Cloud, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-developers.jpg";

const services = [
  { icon: Code, title: "Website Development", desc: "Custom responsive websites and web applications built with modern frameworks and technologies.", link: "/services/web-development" },
  { icon: Cpu, title: "Software Development", desc: "Custom business systems, ERPs, inventory management, and automation software.", link: "/services/software-development" },
  { icon: GraduationCap, title: "School Management Systems", desc: "Complete student, fees, results, and parent portal management solutions.", link: "/services/school-management" },
  { icon: CreditCard, title: "Payment Integration", desc: "M-Pesa, PayPal, and card payment gateway integration for your business.", link: "/services/payment-integration" },
  { icon: MessageSquare, title: "Bulk SMS Platform", desc: "Marketing, transactional, and OTP SMS solutions with developer API.", link: "/services/bulk-sms" },
  { icon: Server, title: "Web Hosting", desc: "Fast SSD hosting with 99.9% uptime, free SSL, and daily backups.", link: "/hosting" },
  { icon: Globe, title: "Domain Registration", desc: "Register .com, .co.ke, .africa, .tech and more at competitive prices.", link: "/domains" },
  { icon: Cloud, title: "Cloud Infrastructure", desc: "Cloud servers, managed hosting, and scalable infrastructure solutions.", link: "/services/web-development" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">What We Do</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            Our <span className="text-accent">Services</span>
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">
            Comprehensive technology solutions tailored to empower your business.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {services.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Link to={s.link} className="service-card block h-full border-r border-b group">
                  <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent transition-colors duration-500">
                    <s.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-3 group-hover:text-accent transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                  <span className="text-accent text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
