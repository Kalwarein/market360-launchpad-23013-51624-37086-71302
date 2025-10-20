import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Store, Package, FileText, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PostingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const postTypes = [
  { id: "job", label: "Add Job", icon: Briefcase, color: "text-blue-500" },
  { id: "store", label: "Add Store/Product", icon: Store, color: "text-green-500" },
  { id: "asset", label: "Add Digital Asset", icon: Package, color: "text-purple-500" },
  { id: "blog", label: "Add Blog", icon: FileText, color: "text-orange-500" },
];

export const PostingModal = ({ open, onOpenChange }: PostingModalProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const handleSubmit = () => {
    toast({
      title: "Post Created",
      description: `Your ${selectedType} has been created (Backend integration pending)`,
    });
    setSelectedType(null);
    setFormData({ title: "", description: "", price: "", category: "" });
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
    setFormData({ title: "", description: "", price: "", category: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {!selectedType ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Create New Post
              </DialogTitle>
              <DialogDescription>
                Choose what you'd like to add
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="flex flex-col items-center gap-3 p-6 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Icon className={`w-8 h-8 ${type.color}`} />
                    <span className="font-semibold text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {postTypes.find((t) => t.id === selectedType)?.label}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your {selectedType}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${selectedType} title`}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={`Describe your ${selectedType}`}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              {(selectedType === "store" || selectedType === "asset") && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (coins)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" type="file" accept="image/*" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Create Post
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
