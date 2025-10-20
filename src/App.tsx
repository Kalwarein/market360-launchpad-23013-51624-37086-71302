import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewSignup from "./pages/NewSignup";
import Signin from "./pages/Signin";
import Onboarding from "./pages/Onboarding";
import NewAppHome from "./pages/NewAppHome";
import Wallet from "./pages/Wallet";
import TopupRequest from "./pages/TopupRequest";
import WithdrawRequest from "./pages/WithdrawRequest";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import Stores from "./pages/Stores";
import CreateStore from "./pages/CreateStore";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<NewSignup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app/home" element={<NewAppHome />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/topup/request" element={<TopupRequest />} />
          <Route path="/withdraw/request" element={<WithdrawRequest />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/stores/create" element={<CreateStore />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
