import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Store, MapPin, Phone, Globe, Calendar, Package } from "lucide-react";

interface StoreDetailModalProps {
  store: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreDetailModal({ store, open, onOpenChange }: StoreDetailModalProps) {
  if (!store) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            {store.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store Banner */}
          {store.banner_url ? (
            <div className="h-48 rounded-lg overflow-hidden">
              <img 
                src={store.banner_url} 
                alt="Store banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Store Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <p className="text-muted-foreground">by @{store.profiles?.username}</p>
              </div>
              <Badge variant={store.store_type === 'digital' ? 'secondary' : 'default'}>
                {store.store_type}
              </Badge>
            </div>

            {store.description && (
              <p className="text-sm leading-relaxed">{store.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold">{store.rating || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Package className="h-4 w-4" />
                  <span className="font-semibold">{store.total_sales || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-semibold">
                    {new Date(store.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Since</p>
              </div>
            </div>

            {/* Contact Info */}
            {(store.profiles?.phone_number || store.profiles?.website_url) && (
              <div className="space-y-2">
                <h3 className="font-semibold">Contact Information</h3>
                {store.profiles?.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{store.profiles.phone_number}</span>
                  </div>
                )}
                {store.profiles?.website_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={store.profiles.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {(store.profiles?.city || store.profiles?.country) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {[store.profiles?.city, store.profiles?.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1">
              Contact Store
            </Button>
            <Button variant="outline" className="flex-1">
              View Products
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}