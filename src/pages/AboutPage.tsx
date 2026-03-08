import { motion } from "framer-motion";
import { Award, Users, Target, Globe, CheckCircle2 } from "lucide-react";
import aboutCoding from "@/assets/about-coding.jpg";
import aboutServers from "@/assets/about-servers.jpg";
import datacenter from "@/assets/hero-datacenter.jpg";
import heroImg from "@/assets/hero-developers.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <span className="section-label !text-accent">About Us</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight">
            About <span className="text-accent">Abancool</span> Technology
          </h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">
            A professional technology company based in Garissa, Kenya providing modern digital solutions.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-max grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-label">Our Mission</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Empowering Businesses Through <span className="text-accent">Technology</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At Abancool Technology, we believe every business deserves access to world-class technology solutions. We bridge the digital gap by providing affordable, reliable, and innovative technology services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              From web development and custom software to hosting infrastructure and payment integrations, we empower businesses to thrive in the digital economy.
            </p>
            <ul className="space-y-3">
              {["World-class development standards", "Affordable pricing for African businesses", "24/7 support and maintenance", "Proven track record of excellence"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src={aboutCoding} alt="Coding" className="w-full h-64 object-cover rounded-sm" />
              <img src={datacenter} alt="Infrastructure" className="w-full h-64 object-cover rounded-sm mt-8" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-section-alt">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="section-label justify-center">Our Values</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "Excellence", desc: "Committed to delivering top-quality solutions in everything we do." },
              { icon: Users, title: "Partnership", desc: "We grow alongside our clients, building lasting relationships." },
              { icon: Target, title: "Innovation", desc: "Embracing cutting-edge technology to solve real problems." },
              { icon: Globe, title: "Global Reach", desc: "Serving Kenya and international clients with equal dedication." },
            ].map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="service-card text-center group">
                <div className="w-14 h-14 rounded-sm bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent transition-colors duration-500">
                  <v.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-500" />
                </div>
                <h3 className="font-heading font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Counter */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutServers} alt="Servers" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/85" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { number: "200+", label: "Projects Delivered" },
            { number: "150+", label: "Happy Clients" },
            { number: "10+", label: "Years Experience" },
            { number: "24/7", label: "Support Available" },
          ].map((s, i) => (
            <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="counter-box">
              <div className="counter-number">{s.number}</div>
              <div className="text-hero-foreground/60 text-sm mt-2 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
