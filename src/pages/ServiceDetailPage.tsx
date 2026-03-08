import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Code, Cpu, GraduationCap, MessageSquare, CreditCard } from "lucide-react";
import heroImg from "@/assets/hero-developers.jpg";

const serviceData: Record<string, { icon: typeof Code; title: string; desc: string; features: string[]; details: string }> = {
  "web-development": {
    icon: Code,
    title: "Website Development",
    desc: "Custom responsive websites built with modern technologies and best practices.",
    details: "We build fast, SEO-optimized, mobile-responsive websites using React, Next.js, and WordPress. From corporate websites to e-commerce stores, we deliver pixel-perfect designs that convert visitors into customers.",
    features: ["Responsive Design", "SEO Optimization", "E-Commerce Integration", "CMS Integration", "Performance Optimization", "Custom UI/UX Design", "Progressive Web Apps", "Maintenance & Support"],
  },
  "software-development": {
    icon: Cpu,
    title: "Software Development",
    desc: "Custom business systems and enterprise software solutions.",
    details: "We develop custom software solutions including ERPs, CRMs, inventory management systems, and workflow automation tools. Our solutions are scalable, secure, and built to streamline your business operations.",
    features: ["Custom ERP Systems", "CRM Development", "Inventory Management", "Workflow Automation", "API Development", "Database Design", "System Integration", "Cloud Deployment"],
  },
  "school-management": {
    icon: GraduationCap,
    title: "School Management Systems",
    desc: "Complete student, fees, and results management solutions.",
    details: "Our school management system covers everything from student enrollment to exam results and fee collection. Parents, teachers, and administrators each get dedicated portals with real-time updates and SMS notifications.",
    features: ["Student Management", "Fees & Payments", "Results Management", "Parent Portal", "Teacher Portal", "SMS Notifications", "Attendance Tracking", "Report Generation"],
  },
  "bulk-sms": {
    icon: MessageSquare,
    title: "Bulk SMS Platform",
    desc: "Marketing, transactional, and OTP SMS solutions with developer API.",
    details: "Send thousands of SMS messages instantly for marketing campaigns, transaction alerts, and OTP verification. Our platform includes a developer-friendly API, delivery reports, and contact management.",
    features: ["Marketing SMS", "Transactional SMS", "OTP SMS", "SMS API Integration", "Contact Management", "Delivery Reports", "Scheduled Sending", "Custom Sender ID"],
  },
  "payment-integration": {
    icon: CreditCard,
    title: "Payment Integration",
    desc: "M-Pesa, PayPal, and card payment gateway integration.",
    details: "We integrate secure payment gateways into your website or application. From M-Pesa STK Push to PayPal and card payments, we ensure your customers can pay seamlessly.",
    features: ["M-Pesa Integration", "PayPal Integration", "Card Payments", "Payment Reconciliation", "Automated Receipts", "Multi-Currency Support", "Subscription Billing", "PCI Compliance"],
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = serviceData[slug || ""];

  if (!service) {
    return (
      <div className="section-padding text-center">
        <h1 className="font-heading text-2xl font-bold mb-4">Service not found</h1>
        <Link to="/services"><Button>Back to Services</Button></Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero/75" />
        </div>
        <div className="relative container-max px-4 lg:px-8 py-20">
          <div className="w-16 h-16 rounded-sm bg-accent/20 flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-accent" />
          </div>
          <span className="section-label !text-accent">Our Services</span>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-hero-foreground">{service.title}</h1>
          <p className="text-hero-foreground/70 text-lg max-w-2xl mt-4">{service.desc}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-muted-foreground leading-relaxed mb-10 text-lg">{service.details}</p>

            <span className="section-label">Features</span>
            <h2 className="font-heading text-2xl font-bold mb-6">Key <span className="text-accent">Features</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {service.features.map((f) => (
                <div key={f} className="flex items-center gap-3 p-4 bg-card border rounded-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-sm">
              <div className="absolute inset-0 bg-hero" />
              <div className="relative p-10 text-center">
                <h3 className="font-heading text-xl font-bold text-hero-foreground mb-2">Ready to get started?</h3>
                <p className="text-hero-foreground/60 mb-6 text-sm">Contact us for a free consultation and quote.</p>
                <Link to="/contact">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm font-semibold uppercase text-xs tracking-wider px-8 h-11">
                    Get a Quote <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
