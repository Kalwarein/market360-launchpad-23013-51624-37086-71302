import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react"; // ✅ for the error icon
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
import Products from "./pages/Products";
import Create from "./pages/Create";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import JobDetail from "./pages/JobDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ✅ Link blocker with styled toast
const LinkBlocker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (target && target.href) {
        if (target.href.includes("lovable.dev/projects/0bd253db")) {
          e.preventDefault();

          toast.error("Can't visit that site right now.", {
            description: "Please try again later.",
            icon: <AlertCircle className="text-red-500 w-5 h-5" />,
            action: {
              label: "OK",
              onClick: () => navigate("/"),
            },
            style: {
              background: "#1f1f1f",
              color: "#fff",
              border: "1px solid #ff4444",
              borderRadius: "12px",
            },
          });
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LinkBlocker /> {/* 👈 handles blocking + toast */}
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
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/stores/create" element={<CreateStore />} />
          <Route path="/products" element={<Products />} />
          <Route path="/create" element={<Create />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
