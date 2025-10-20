import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Home, Briefcase, Store, Users, Building2, Wallet, Search, Bell, Menu, Plus, LogOut
} from "lucide-react";
import { Shimmer, ShimmerList } from "@/components/Shimmer";
import { toast } from "@/hooks/use-toast";

export default function NewAppHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    const { data: profile } = await supabase
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
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
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
      <main className="container mx-auto px-4 py-6 pb-24">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="home">
              <Home className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="stores">
              <Store className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="organizations">
              <Building2 className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to Market360</h2>
              <p className="text-muted-foreground mb-4">
                Your complete marketplace platform
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <Button onClick={() => navigate("/wallet")}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
                <Button variant="outline" onClick={() => navigate("/store/create")}>
                  <Store className="w-4 h-4 mr-2" />
                  Create Store
                </Button>
              </div>
            </div>

            <div className="text-center py-12">
              <p className="text-muted-foreground">Feed content will be implemented in Phase 4</p>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Jobs & Freelancing</h3>
              <p className="text-muted-foreground mb-4">
                Find work or hire talent
              </p>
              <Button onClick={() => navigate("/jobs/post")}>
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Stores & Marketplace</h3>
              <p className="text-muted-foreground mb-4">
                Browse stores and products
              </p>
              <Button onClick={() => navigate("/store/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-muted-foreground">
                Connect with others
              </p>
            </div>
          </TabsContent>

          <TabsContent value="organizations">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Organizations</h3>
              <p className="text-muted-foreground">
                Discover organizations and NGOs
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Button variant="ghost" size="sm">
              <Home className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Briefcase className="w-5 h-5" />
            </Button>
            <Button size="icon" className="rounded-full w-14 h-14 -mt-8 shadow-lg">
              <Plus className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
