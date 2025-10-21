import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Briefcase, ShoppingBag, Store as StoreIcon, Wrench, Upload, X, ArrowLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";

export default function Create() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [viewMode, setViewMode] = useState<"all" | "my-posts">("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    jobType: "full-time",
    salary: "",
    storeType: "physical",
  });

  const postTypes = [
    { id: "text", label: "Post", icon: FileText, desc: "Share updates and thoughts", color: "bg-blue-500" },
    { id: "job", label: "Job/Gig", icon: Briefcase, desc: "Post a job opening or gig", color: "bg-purple-500" },
    { id: "product", label: "Product", icon: ShoppingBag, desc: "Sell a product", color: "bg-green-500" },
    { id: "service", label: "Service", icon: Wrench, desc: "Offer a service", color: "bg-orange-500" },
    { id: "store", label: "Store", icon: StoreIcon, desc: "Create a new store", color: "bg-pink-500" },
  ];

  useEffect(() => {
    checkAuth();
    if (viewMode === "my-posts") {
      fetchMyPosts();
    }
  }, [viewMode]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // @ts-ignore
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setUser(profile);

    // @ts-ignore
    const { data: balance } = await (supabase as any)
      .from("user_balances")
      .select("balance")
      .eq("user_id", session.user.id)
      .single();

    if (balance) setCoinBalance(balance.balance || 0);
  };

  const fetchMyPosts = async () => {
    if (!user) return;

    try {
      // Fetch all user's content
      // @ts-ignore
      const { data: posts } = await (supabase as any)
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // @ts-ignore
      const { data: jobs } = await (supabase as any)
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // @ts-ignore
      const { data: stores } = await (supabase as any)
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const combined = [
        ...(posts || []).map((p: any) => ({ ...p, type: "post" })),
        ...(jobs || []).map((j: any) => ({ ...j, type: "job" })),
        ...(stores || []).map((s: any) => ({ ...s, type: "store" })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMyPosts(combined);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      let imageUrl = "";
      
      if (imageFile) {
        const bucket = selectedType === "store" ? "store-images" : 
                      selectedType === "product" ? "product-images" : "profile-images";
        imageUrl = await uploadImage(imageFile, bucket);
      }

      if (selectedType === "text") {
        // @ts-ignore
        const { error } = await (supabase as any).from("posts").insert({
          user_id: user.id,
          content: formData.description,
          post_type: "text",
          images: imageUrl ? [imageUrl] : null,
        });
        if (error) throw error;
      } else if (selectedType === "job") {
        // @ts-ignore
        const { error } = await (supabase as any).from("jobs").insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          job_type: formData.jobType as any,
          salary_min: parseFloat(formData.salary) || 0,
        });
        if (error) throw error;
      } else if (selectedType === "product") {
        toast({
          title: "Store Required",
          description: "Please create a store first, then add products from the store page.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      } else if (selectedType === "service") {
        // @ts-ignore
        const { error } = await (supabase as any).from("jobs").insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          job_type: "freelance",
          salary_min: parseFloat(formData.price) || 0,
        });
        if (error) throw error;
      } else if (selectedType === "store") {
        // @ts-ignore
        const { error } = await (supabase as any).from("stores").insert({
          user_id: user.id,
          name: formData.title,
          description: formData.description,
          store_type: formData.storeType,
          logo_url: imageUrl,
        });
        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: `Your ${selectedType} has been created successfully.`,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        jobType: "full-time",
        salary: "",
        storeType: "physical",
      });
      setImageFile(null);
      setImagePreview("");
      setSelectedType(null);
      fetchMyPosts();
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
      <AppHeader onWalletClick={() => navigate("/wallet")} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 mt-16">
        {/* Toggle between All and My Posts */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="all">Create New</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {!selectedType ? (
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Create Something</h1>
                <p className="text-muted-foreground mb-6">What would you like to create today?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card 
                        key={type.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardHeader>
                          <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle>{type.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{type.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSelectedType(null);
                    setFormData({
                      title: "",
                      description: "",
                      price: "",
                      category: "",
                      jobType: "full-time",
                      salary: "",
                      storeType: "physical",
                    });
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Create {postTypes.find(t => t.id === selectedType)?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedType === "text" && (
                      <>
                        <div className="space-y-2">
                          <Label>What's on your mind?</Label>
                          <Textarea
                            rows={5}
                            placeholder="Share your thoughts..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Add Image (Optional)</Label>
                          {imagePreview ? (
                            <div className="relative">
                              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                              <Label htmlFor="image-upload" className="cursor-pointer text-primary hover:underline">
                                Click to upload
                              </Label>
                              <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {selectedType === "job" && (
                      <>
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            placeholder="e.g., Software Developer"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Type</Label>
                          <Select
                            value={formData.jobType}
                            onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Salary (SLE)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 5000"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Description *</Label>
                          <Textarea
                            rows={4}
                            placeholder="Describe the role, requirements, responsibilities..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedType === "service" && (
                      <>
                        <div className="space-y-2">
                          <Label>Service Title *</Label>
                          <Input
                            placeholder="e.g., Web Design Services"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Starting Price (SLE)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description *</Label>
                          <Textarea
                            rows={4}
                            placeholder="Describe your service..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedType === "store" && (
                      <>
                        <div className="space-y-2">
                          <Label>Store Name *</Label>
                          <Input
                            placeholder="e.g., John's Electronics"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Store Type</Label>
                          <Select
                            value={formData.storeType}
                            onValueChange={(value) => setFormData({ ...formData, storeType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="physical">Physical Products</SelectItem>
                              <SelectItem value="digital">Digital Products</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Store Logo</Label>
                          {imagePreview ? (
                            <div className="relative">
                              <img src={imagePreview} alt="Logo preview" className="w-32 h-32 object-cover rounded" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                              <Label htmlFor="logo-upload" className="cursor-pointer text-primary hover:underline">
                                Upload logo
                              </Label>
                              <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Description *</Label>
                          <Textarea
                            rows={4}
                            placeholder="Tell customers about your store..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={loading || (!formData.title && !formData.description)}
                    >
                      {loading ? "Creating..." : "Create"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-posts">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">My Posts</h2>
              {myPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>You haven't created anything yet.</p>
                    <Button className="mt-4" onClick={() => setViewMode("all")}>
                      Create Something
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{post.title || post.name || post.content?.substring(0, 50)}</span>
                          <span className="text-sm font-normal text-muted-foreground capitalize">
                            {post.type}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.description || post.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === "create") return;
          setActiveTab(tab);
          const routes: Record<string, string> = {
            home: "/app/home",
            jobs: "/jobs",
            markets: "/stores",
            profile: "/profile",
          };
          if (routes[tab]) navigate(routes[tab]);
        }}
        onCreateClick={() => {}}
      />
    </div>
  );
}
