import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Tools from "./pages/Tools";
import CookieFilter from "./pages/CookieFilter";
import CookieConverter from "./pages/CookieConverter";
import TextDeduplicator from "./pages/TextDeduplicator";
import EmailDomainFormatter from "./pages/EmailDomainFormatter";
import DiscordFormatter from "./pages/DiscordFormatter";
import NumberExtractor from "./pages/NumberExtractor";
import NumberGenerator from "./pages/NumberGenerator"; // Import added here
import SoftwareDownload from "./pages/SoftwareDownload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/test">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/jh" element={<CookieFilter />} />
          <Route path="/cookie" element={<CookieConverter />} />
          <Route path="/qc" element={<TextDeduplicator />} />
          <Route path="/yopmail" element={<EmailDomainFormatter />} />
          <Route path="/discord" element={<DiscordFormatter />} />
          <Route path="/14" element={<NumberExtractor />} />
          <Route path="/14d" element={<NumberGenerator />} /> {/* Route added here */}
          <Route path="/rj" element={<SoftwareDownload />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;