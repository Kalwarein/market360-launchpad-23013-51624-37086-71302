import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut, Users, Wallet, Settings, FileText, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TopupQueue } from "@/components/admin/TopupQueue";
import { WithdrawalQueue } from "@/components/admin/WithdrawalQueue";

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const adminAuth = sessionStorage.getItem("admin_auth");
    const authTime = sessionStorage.getItem("admin_auth_time");

    if (!adminAuth || !authTime) {
      navigate("/admin-login");
      return;
    }

    // Check if session expired (4 hours)
    const elapsed = Date.now() - parseInt(authTime);
    if (elapsed > 4 * 60 * 60 * 1000) {
      sessionStorage.removeItem("admin_auth");
      sessionStorage.removeItem("admin_auth_time");
      toast({
        title: "Session Expired",
        description: "Please login again",
      });
      navigate("/admin-login");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // @ts-ignore - Types will regenerate after migration
    const { data: hasAdminRole } = await (supabase as any)
      .rpc("has_role", { 
        _user_id: session.user.id, 
        _role: "admin" 
      });

    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "Admin permissions required",
        variant: "destructive",
      });
      navigate("/app/home");
      return;
    }

    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_auth_time");
    navigate("/app/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Market360 Administration</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="topups" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="topups">
              <Wallet className="w-4 h-4 mr-2" />
              Top-ups
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <Wallet className="w-4 h-4 mr-2" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topups">
            <TopupQueue />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalQueue />
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-card rounded-lg border p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">User Management</h2>
              <p className="text-muted-foreground">This section will be implemented in Phase 3</p>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="bg-card rounded-lg border p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Audit Logs</h2>
              <p className="text-muted-foreground">This section will be implemented in Phase 3</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-lg border p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">System Settings</h2>
              <p className="text-muted-foreground">This section will be implemented in Phase 3</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
