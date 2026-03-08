import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Server, Code, Globe, MessageSquare, CreditCard, Shield, ArrowRight, CheckCircle2, Quote } from "lucide-react";
import heroImg from "@/assets/hero-developers.jpg";
import aboutCoding from "@/assets/about-coding.jpg";
import aboutServers from "@/assets/about-servers.jpg";
import datacenter from "@/assets/hero-datacenter.jpg";

/* ── Animated Counter ── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { start = end; clearInterval(timer); }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Data ── */
const services = [
  { icon: Code, title: "Web\nDevelopment", desc: "Custom responsive websites built with modern technologies and best practices." },
  { icon: Server, title: "Web\nHosting", desc: "Fast, secure SSD hosting with 99.9% uptime guarantee and daily backups." },
  { icon: Globe, title: "Domain\nRegistration", desc: "Register .com, .co.ke, .africa and more at competitive prices." },
  { icon: MessageSquare, title: "Bulk SMS\nPlatform", desc: "Marketing, transactional, and OTP SMS solutions with developer API." },
  { icon: CreditCard, title: "Payment\nIntegration", desc: "M-Pesa, PayPal, and card payment gateway integration for your business." },
  { icon: Shield, title: "Software\nDevelopment", desc: "Custom business systems, ERPs, school management, and automation software." },
];

const projects = [
  { title: "School Management System", category: "Education", img: aboutCoding },
  { title: "E-Commerce Platform", category: "Web Development", img: datacenter },
  { title: "M-Pesa Payment Gateway", category: "Integration", img: aboutServers },
  { title: "Corporate Website", category: "Web Development", img: heroImg },
];

const testimonials = [
  { name: "James Mwangi", role: "CEO, TechStart Kenya", text: "Abancool Technology transformed our business with a seamless school management system. Their expertise and dedication are unmatched." },
  { name: "Amina Hassan", role: "Founder, ShopKenya", text: "The M-Pesa integration was flawless. Our customers can now pay instantly and we've seen a 40% increase in completed transactions." },
  { name: "David Ochieng", role: "Director, EduPro", text: "Professional, reliable, and innovative. Abancool delivered our project on time and the support has been exceptional." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function HomePage() {
  return (
    <>
      {/* ═══════ HERO — Full viewport, XtraTheme style ═══════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Developers at work" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/70" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-accent font-bold text-sm uppercase tracking-[0.25em] mb-4">
              It's who we are. It's what we do.
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-hero-foreground leading-[1.1] mb-6">
              We Build Trust,{" "}
              <br className="hidden md:block" />
              We're{" "}
              <span className="text-accent">Abancool</span>{" "}
              <span className="text-accent">Technology</span>
            </h1>
            <p className="text-hero-foreground/70 text-lg max-w-xl mb-10 leading-relaxed">
              Delivering powerful digital solutions including websites, software systems, payment integrations, hosting services, and bulk SMS platforms.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
                  Contact Us
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="outline" className="border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground/10 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
                  See Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ ABOUT SECTION — Image collage + text ═══════ */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="section-label">About Our Company</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                We Build Trust,<br />
                We're <span className="text-accent">Abancool</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Abancool Technology is a professional technology company based in Garissa, Kenya providing modern digital solutions for businesses, organizations, institutions, and startups across Africa and beyond.
              </p>
              <ul className="space-y-3 mb-8">
                {["Best Quality Solutions", "Expert Development Team", "Fast & Reliable Delivery"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-xs tracking-wider px-8 h-11 rounded-sm">
                  About Us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img src={aboutCoding} alt="Developer coding" className="w-full h-64 object-cover rounded-sm" />
                  <img src={aboutServers} alt="Server room" className="w-full h-40 object-cover rounded-sm" />
                </div>
                <div className="pt-8">
                  <img src={datacenter} alt="Data center" className="w-full h-72 object-cover rounded-sm" />
                  <div className="mt-4 bg-accent rounded-sm p-5 text-accent-foreground text-center">
                    <div className="text-3xl font-heading font-bold">10+</div>
                    <div className="text-xs uppercase tracking-wider opacity-80">Years Experience</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ SERVICES — XtraTheme card style ═══════ */}
      <section className="section-padding bg-section-alt">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="section-label justify-center">Our Services</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              What We Offer &<br />
              <span className="text-accent">What We Do.</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Comprehensive technology solutions tailored for your business needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border">
            {services.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Link to={i < 2 ? (i === 0 ? "/services/web-development" : "/hosting") : i === 2 ? "/domains" : i === 3 ? "/services/bulk-sms" : i === 4 ? "/services/payment-integration" : "/services/software-development"}
                  className="service-card block h-full border-r border-b group"
                >
                  <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent transition-colors duration-500">
                    <s.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-3 whitespace-pre-line leading-snug group-hover:text-accent transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PROJECTS — Hover overlay style ═══════ */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="section-label">Latest Projects</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold">Featured Projects</h2>
            </div>
            <Link to="/portfolio">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-xs tracking-wider px-6 h-11 rounded-sm">
                All Projects <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <div className="project-card h-80 rounded-sm">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700" />
                  <div className="project-overlay rounded-sm">
                    <span className="text-accent text-xs font-bold uppercase tracking-wider">{p.category}</span>
                    <h3 className="font-heading font-bold text-hero-foreground text-lg mt-1">{p.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COUNTER STATS — Dark section with image ═══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={datacenter} alt="Infrastructure" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/85" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: 200, suffix: "+", label: "Projects Done" },
              { number: 150, suffix: "+", label: "Happy Clients" },
              { number: 99, suffix: "%", label: "Uptime Guarantee" },
              { number: 24, suffix: "/7", label: "Support Available" },
            ].map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="counter-box">
                <div className="counter-number">
                  <Counter end={s.number} suffix={s.suffix} />
                </div>
                <div className="text-hero-foreground/60 text-sm mt-2 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding bg-section-alt">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="section-label justify-center">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold">What Clients Say?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="bg-card p-8 rounded-sm border hover-lift"
              >
                <Quote className="w-8 h-8 text-accent/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-heading font-bold text-accent text-sm">{t.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOSTING PREVIEW ═══════ */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="section-label justify-center">Hosting Plans</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold">
              Reliable & Fast<br />
              <span className="text-accent">Web Hosting</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-4xl mx-auto border border-border">
            {[
              { name: "Starter", price: "3,000", features: ["5GB SSD", "20GB Bandwidth", "Free SSL", "5 Emails"] },
              { name: "Business", price: "6,000", features: ["20GB SSD", "Unlimited BW", "Free SSL", "Unlimited Emails"], popular: true },
              { name: "Professional", price: "12,000", features: ["50GB SSD", "Unlimited BW", "Daily Backups", "10 Websites"] },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`p-8 border-r last:border-r-0 ${plan.popular ? "bg-hero text-hero-foreground relative" : "bg-card"}`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                    Popular
                  </span>
                )}
                <h3 className="font-heading font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-3xl font-heading font-bold ${plan.popular ? "text-accent" : "text-accent"}`}>KSh {plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-hero-foreground/60" : "text-muted-foreground"}`}>/year</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.popular ? "text-hero-foreground/80" : "text-muted-foreground"}`}>
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-accent" : "text-accent"}`} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/hosting">
                  <Button className={`w-full rounded-sm font-semibold uppercase text-xs tracking-wider ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }`}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/hosting" className="text-accent text-sm font-semibold uppercase tracking-wider hover:underline inline-flex items-center gap-1">
              View all plans <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ DOMAIN SEARCH ═══════ */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <img src={aboutServers} alt="Servers" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/90" />
        </div>
        <div className="relative container-max px-4 lg:px-8 text-center">
          <span className="section-label justify-center !text-accent">Domain Registration</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-hero-foreground mb-4">
            Find Your Perfect Domain
          </h2>
          <p className="text-hero-foreground/60 mb-8 max-w-md mx-auto">
            Register .com, .co.ke, .africa and more starting from KSh 1,200/year.
          </p>
          <Link to="/domains">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase text-sm tracking-wider px-8 h-12 rounded-sm">
              Search Domains <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
