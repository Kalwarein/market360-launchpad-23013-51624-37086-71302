import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function CreateStore() {
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick } = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    store_type: "physical" as "physical" | "digital",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // @ts-ignore - Types will regenerate after migration
      const { error } = await (supabase as any).from("stores").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        store_type: formData.store_type,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Store created successfully!",
      });
      navigate("/stores");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl mt-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/stores")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Store</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Store Type</Label>
                <RadioGroup
                  value={formData.store_type}
                  onValueChange={(value: any) => setFormData({ ...formData, store_type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="physical" />
                    <Label htmlFor="physical" className="font-normal cursor-pointer">
                      Physical - Sell physical products
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital" id="digital" />
                    <Label htmlFor="digital" className="font-normal cursor-pointer">
                      Digital - Sell digital products & apps
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
