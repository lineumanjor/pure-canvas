import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/hooks/useTheme";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BecomePartner from "./pages/BecomePartner";
import Admin from "./pages/Admin";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerStore from "./pages/PartnerStore";
import Partners from "./pages/Partners";
import OrderHistory from "./pages/OrderHistory";
import ReviewOrder from "./pages/ReviewOrder";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAUpdatePrompt />
            <PWAInstallPrompt />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/parceiros" element={<Partners />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/seja-parceiro" element={<BecomePartner />} />
              <Route path="/eunice-admin" element={<Admin />} />
              <Route path="/painel-parceiro" element={<PartnerDashboard />} />
              <Route path="/loja/:partnerId" element={<PartnerStore />} />
              <Route path="/meus-pedidos" element={<OrderHistory />} />
              <Route path="/avaliar/:orderId" element={<ReviewOrder />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
