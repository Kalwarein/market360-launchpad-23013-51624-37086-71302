import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const signinSchema = z.object({
  emailOrUsername: z.string().min(1, { message: "Email or username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Signin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // @ts-ignore - Types will regenerate after migration
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.onboarding_completed) {
          navigate("/app/home");
        } else {
          navigate("/onboarding");
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = signinSchema.parse(formData);
      setLoading(true);

      let emailToUse = validatedData.emailOrUsername;

      // If input doesn't contain @, it's a username - look up the email
      if (!validatedData.emailOrUsername.includes("@")) {
        // @ts-ignore - Types will regenerate after migration
        const { data: profileData, error: lookupError } = await (supabase as any)
          .from("profiles")
          .select("email")
          .eq("username", validatedData.emailOrUsername)
          .maybeSingle();

        if (lookupError || !profileData) {
          toast({
            title: "Error",
            description: "Invalid credentials",
            variant: "destructive",
          });
          return;
        }

        emailToUse = profileData.email;
      }

      // Sign in with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: validatedData.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        checkOnboardingStatus(data.user.id);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async (userId: string) => {
    // @ts-ignore - Types will regenerate after migration
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (profile?.onboarding_completed) {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      navigate("/app/home");
    } else {
      toast({
        title: "Welcome!",
        description: "Please complete your onboarding.",
      });
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Market360</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="you@example.com or username"
                value={formData.emailOrUsername}
                onChange={(e) => handleChange("emailOrUsername", e.target.value)}
                className={errors.emailOrUsername ? "border-destructive" : ""}
              />
              {errors.emailOrUsername && <p className="text-sm text-destructive">{errors.emailOrUsername}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}