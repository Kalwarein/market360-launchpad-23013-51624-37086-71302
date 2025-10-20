import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Briefcase, ShoppingBag, Store as StoreIcon, Wrench, Image as ImageIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

type PostType = "text" | "job" | "product" | "service" | "store" | null;

export const CreatePostModal = ({ open, onOpenChange, userId }: CreatePostModalProps) => {
  const [postType, setPostType] = useState<PostType>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    images: "",
    jobType: "",
    salary: "",
  });

  const postTypes = [
    { id: "text", label: "Post", icon: FileText, desc: "Share updates and thoughts" },
    { id: "job", label: "Job/Gig", icon: Briefcase, desc: "Post a job opening or gig" },
    { id: "product", label: "Product", icon: ShoppingBag, desc: "Sell a product" },
    { id: "service", label: "Service", icon: Wrench, desc: "Offer a service" },
    { id: "store", label: "Store", icon: StoreIcon, desc: "Create a new store" },
  ];

  const handleSubmit = async () => {
    if (!postType) return;
    
    setLoading(true);
    try {
      if (postType === "text") {
        // Create a text post
        // @ts-ignore - Types will regenerate after migration
        const { error } = await (supabase as any).from("posts").insert({
          user_id: userId,
          content: formData.description,
          post_type: "text",
        });
        if (error) throw error;
      } else if (postType === "job") {
        // Create a job posting
        // @ts-ignore - Types will regenerate after migration
        const { error } = await (supabase as any).from("jobs").insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          job_type: formData.jobType as any || "full-time",
          salary_min: parseFloat(formData.salary) || 0,
        });
        if (error) throw error;
      } else if (postType === "product") {
        // For now, we need a store_id, so show error
        toast({
          title: "Store Required",
          description: "Please create a store first before adding products.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      } else if (postType === "service") {
        // Post as a job/gig
        // @ts-ignore - Types will regenerate after migration
        const { error } = await (supabase as any).from("jobs").insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          job_type: "freelance",
          salary_min: parseFloat(formData.price) || 0,
        });
        if (error) throw error;
      } else if (postType === "store") {
        // Create a store
        // @ts-ignore - Types will regenerate after migration
        const { error } = await (supabase as any).from("stores").insert({
          user_id: userId,
          name: formData.title,
          description: formData.description,
          store_type: "physical",
        });
        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: `Your ${postType} has been created successfully.`,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        images: "",
        jobType: "",
        salary: "",
      });
      setPostType(null);
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New</DialogTitle>
        </DialogHeader>

        {!postType ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground mb-4">What would you like to create?</p>
            {postTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-4 hover:bg-primary/10 hover:border-primary"
                  onClick={() => setPostType(type.id as PostType)}
                >
                  <Icon className="w-5 h-5 mr-3 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.desc}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPostType(null)}
              className="mb-2"
            >
              ← Back
            </Button>

            {postType === "text" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">What's on your mind?</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Share your thoughts..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Add Image URLs (Optional)</Label>
                  <Input
                    id="images"
                    placeholder="https://example.com/image.jpg"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  />
                </div>
              </>
            )}

            {postType === "job" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
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
                  <Label htmlFor="salary">Salary (SLE)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the job role, requirements, and responsibilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {postType === "product" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Product Name *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., iPhone 13 Pro"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (SLE) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 2500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Electronics"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {postType === "service" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Web Design Services"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Starting Price (SLE)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Service Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe what you offer..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {postType === "store" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Store Name *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., John's Electronics"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description *</Label>
                  <Textarea
                    id="description"
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
              disabled={loading || !formData.title && !formData.description}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
