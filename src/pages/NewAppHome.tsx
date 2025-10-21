import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Home, Briefcase, Store, User, Wallet, Search, Bell, Menu, Plus, LogOut
} from "lucide-react";
import { Shimmer, ShimmerList } from "@/components/Shimmer";
import { toast } from "@/hooks/use-toast";
import { BottomNav } from "@/components/app/BottomNav";
import { TabContent } from "@/components/app/TabContent";
import { CreatePostModal } from "@/components/app/CreatePostModal";

export default function NewAppHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // @ts-ignore - Types will regenerate after migration
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      navigate("/onboarding");
      return;
    }

    setUser(profile);

    // Get user balance
    // @ts-ignore - Types will regenerate after migration
    const { data: balanceData } = await (supabase as any)
      .from("user_balances")
      .select("available_balance")
      .eq("user_id", session.user.id)
      .single();

    if (balanceData) {
      setBalance(parseFloat(balanceData?.available_balance || "0"));
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Shimmer className="h-16 w-full mb-4" />
          <ShimmerList count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")}>
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-primary">Market360</h1>
                <p className="text-xs text-muted-foreground">@{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/wallet")}
              >
                <Wallet className="w-4 h-4" />
                {balance.toFixed(2)} SLE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <TabContent activeTab={activeTab} userId={user?.id || ""} />
      </main>

      {/* Logout Button */}
      <div className="container mx-auto px-4 pb-6">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCreateClick={() => navigate("/create")}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        userId={user?.id || ""}
      />
    </div>
  );
}
