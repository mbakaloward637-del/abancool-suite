import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import HostingPage from "./pages/HostingPage";
import DomainsPage from "./pages/DomainsPage";
import PortfolioPage from "./pages/PortfolioPage";
import ContactPage from "./pages/ContactPage";
import ClientLoginPage from "./pages/client/ClientLoginPage";
import ClientDashboardLayout from "./pages/client/ClientDashboardLayout";
import DashboardOverview from "./pages/client/DashboardOverview";
import ClientHosting from "./pages/client/ClientHosting";
import ClientDomains from "./pages/client/ClientDomains";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientPayments from "./pages/client/ClientPayments";
import ClientSupport from "./pages/client/ClientSupport";
import ClientProfile from "./pages/client/ClientProfile";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
          <Route path="/services/:slug" element={<Layout><ServiceDetailPage /></Layout>} />
          <Route path="/hosting" element={<Layout><HostingPage /></Layout>} />
          <Route path="/domains" element={<Layout><DomainsPage /></Layout>} />
          <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

          {/* Client */}
          <Route path="/client/login" element={<ClientLoginPage />} />
          <Route path="/client/dashboard" element={<ClientDashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="hosting" element={<ClientHosting />} />
            <Route path="domains" element={<ClientDomains />} />
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="support" element={<ClientSupport />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
