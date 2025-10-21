import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Plus, Star, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { StoreDetailModal } from "@/components/app/StoreDetailModal";

export default function Stores() {
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick, handleTabChange, handleCreateClick } = useAppNavigation();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("stores")
        .select(`
          *,
          profiles:user_id (username, phone_number, website_url, city, country)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStores(data || []);
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

  const handleStoreClick = (store: any) => {
    setSelectedStore(store);
    setShowStoreModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 mt-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate("/products")} 
              className="flex-1"
              variant="default"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Buy Products
            </Button>
            <Button 
              onClick={() => navigate("/stores/create")} 
              className="flex-1"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Sell (Create Store)
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">All Stores</h2>

        {loading ? (
          <div className="text-center py-12">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No stores available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Card 
                key={store.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleStoreClick(store)}
              >
                {store.banner_url ? (
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={store.banner_url} 
                      alt="Store banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {store.logo_url ? (
                          <img 
                            src={store.logo_url} 
                            alt="Store logo"
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                        {store.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by @{store.profiles?.username}
                      </p>
                    </div>
                    <Badge variant={store.store_type === 'digital' ? 'secondary' : 'default'}>
                      {store.store_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">
                    {store.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{store.rating || 0}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {store.total_sales || 0} sales
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav 
        activeTab="markets" 
        onTabChange={handleTabChange} 
        onCreateClick={handleCreateClick} 
      />

      <StoreDetailModal 
        store={selectedStore}
        open={showStoreModal}
        onOpenChange={setShowStoreModal}
      />
    </div>
  );
}
