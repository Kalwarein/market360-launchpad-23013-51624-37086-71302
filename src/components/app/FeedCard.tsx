import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Store, Package, FileText, Heart, MessageCircle, Share2 } from "lucide-react";

interface FeedCardProps {
  type: "job" | "store" | "asset" | "blog" | "post";
  title: string;
  description: string;
  author: string;
  price?: number;
  category?: string;
  featured?: boolean;
}

const typeConfig = {
  job: { icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  store: { icon: Store, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  asset: { icon: Package, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
  blog: { icon: FileText, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
  post: { icon: FileText, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950" },
};

export const FeedCard = ({
  type,
  title,
  description,
  author,
  price,
  category,
  featured,
}: FeedCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card className={`hover:shadow-lg transition-all ${featured ? "border-primary border-2" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{author}</CardDescription>
            </div>
          </div>
          {featured && <Badge className="bg-primary">Featured</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
            {price !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {price} coins
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
