import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      {/* CTA Bar */}
      <div className="bg-accent">
        <div className="container-max px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-accent-foreground">
            <h3 className="font-heading font-bold text-xl">Ready to Start Your Project?</h3>
            <p className="text-sm opacity-80">Let's build something amazing together.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-hero text-hero-foreground px-6 py-3 font-semibold text-sm uppercase tracking-wider hover:bg-hero/90 transition-colors rounded-sm">
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-hero text-hero-foreground">
        <div className="container-max section-padding !py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                  <span className="text-accent-foreground font-heading font-extrabold text-lg">A</span>
                </div>
                <div className="leading-tight">
                  <span className="font-heading font-bold text-lg block">ABANCOOL</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">Technology</span>
                </div>
              </div>
              <p className="text-sm opacity-60 leading-relaxed">
                Professional technology solutions for modern businesses. Based in Garissa, Kenya, serving clients locally and internationally.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-accent">Services</h4>
              <div className="space-y-2.5 text-sm opacity-60">
                <Link to="/services/web-development" className="block hover:opacity-100 hover:text-accent transition-all">Web Development</Link>
                <Link to="/services/software-development" className="block hover:opacity-100 hover:text-accent transition-all">Software Development</Link>
                <Link to="/hosting" className="block hover:opacity-100 hover:text-accent transition-all">Web Hosting</Link>
                <Link to="/domains" className="block hover:opacity-100 hover:text-accent transition-all">Domain Registration</Link>
                <Link to="/services/bulk-sms" className="block hover:opacity-100 hover:text-accent transition-all">Bulk SMS</Link>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-accent">Company</h4>
              <div className="space-y-2.5 text-sm opacity-60">
                <Link to="/about" className="block hover:opacity-100 hover:text-accent transition-all">About Us</Link>
                <Link to="/portfolio" className="block hover:opacity-100 hover:text-accent transition-all">Portfolio</Link>
                <Link to="/contact" className="block hover:opacity-100 hover:text-accent transition-all">Contact</Link>
                <Link to="/client/login" className="block hover:opacity-100 hover:text-accent transition-all">Client Login</Link>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-accent">Contact</h4>
              <div className="space-y-4 text-sm opacity-60">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
                  <span>0728825152</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
                  <span>info@abancool.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
                  <span>Garissa, Kenya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-hero-foreground/10">
          <div className="container-max px-4 lg:px-8 py-5 text-center text-xs opacity-40">
            © {new Date().getFullYear()} Abancool Technology. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
