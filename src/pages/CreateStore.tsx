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
import { ArrowLeft, Upload, X } from "lucide-react";
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, bucket: string, folder: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = "";
      let bannerUrl = "";

      // Upload logo if provided
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, "store-images", "logos");
      }

      // Upload banner if provided
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, "store-images", "banners");
      }

      // @ts-ignore - Types will regenerate after migration
      const { error } = await (supabase as any).from("stores").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        store_type: formData.store_type,
        logo_url: logoUrl,
        banner_url: bannerUrl,
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
      setUploading(false);
    }
  };

  const handleFileChange = (file: File | null, type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoFile(file);
    } else {
      setBannerFile(file);
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

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {logoFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{logoFile.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFileChange(null, 'logo')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <span className="text-sm text-primary hover:underline">
                            Upload logo image
                          </span>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(file, 'logo');
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <Label>Store Banner</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {bannerFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{bannerFile.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFileChange(null, 'banner')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <Label htmlFor="banner-upload" className="cursor-pointer">
                          <span className="text-sm text-primary hover:underline">
                            Upload banner image
                          </span>
                          <Input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(file, 'banner');
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || uploading}>
                {uploading ? "Uploading images..." : loading ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
