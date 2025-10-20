import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  // DEFAULT ADMIN PASSWORDS (for testing only)
  const ADMIN_PASSWORD_1 = "Admin@Market360!First";
  const ADMIN_PASSWORD_2 = "Admin@Market360!Second";

  const handlePassword1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password1 === ADMIN_PASSWORD_1) {
      setStep(2);
      toast({
        title: "First password correct",
        description: "Enter second password to continue",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect first password",
        variant: "destructive",
      });
    }
  };

  const handlePassword2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password2 !== ADMIN_PASSWORD_2) {
      toast({
        title: "Access Denied",
        description: "Incorrect second password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if user is logged in and is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not authenticated",
          description: "Please sign in first",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }

      // Check if user has admin role
      // @ts-ignore - Types will regenerate after migration
      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/app/home");
        return;
      }

      // Store admin session flag
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_auth_time", Date.now().toString());

      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      });
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Two-factor authentication required
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handlePassword1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password1">First Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password1"
                    type="password"
                    placeholder="Enter first password"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold mb-1">Default Test Password 1:</p>
                <code className="text-xs break-all">{ADMIN_PASSWORD_1}</code>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePassword2} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password2">Second Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password2"
                    type="password"
                    placeholder="Enter second password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Access Admin Panel"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep(1);
                  setPassword2("");
                }}
              >
                Back
              </Button>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold mb-1">Default Test Password 2:</p>
                <code className="text-xs break-all">{ADMIN_PASSWORD_2}</code>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
