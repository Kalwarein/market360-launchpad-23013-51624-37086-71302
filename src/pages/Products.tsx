import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";

export default function Products() {
  const navigate = useNavigate();
  const [coinBalance, setCoinBalance] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // @ts-ignore
    const { data: balance } = await (supabase as any)
      .from("user_balances")
      .select("balance")
      .eq("user_id", session.user.id)
      .single();

    if (balance) setCoinBalance(balance.balance || 0);
  };

  const fetchProducts = async () => {
    try {
      // @ts-ignore
      const { data, error } = await (supabase as any)
        .from("products")
        .select(`
          *,
          stores:store_id (name, logo_url),
          profiles:user_id (username)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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

  const handleBuy = (product: any) => {
    toast({
      title: "Coming Soon",
      description: "Purchase functionality will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={() => navigate("/wallet")} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="hover:shadow-lg transition-shadow"
              >
                {product.images && product.images[0] ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-primary/40" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-1">
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {product.stores?.name || product.profiles?.username}
                      </p>
                    </div>
                    <Badge variant={product.product_type === 'digital' ? 'secondary' : 'default'}>
                      {product.product_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">
                    {product.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {product.price} SLE
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">{product.rating || 0}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleBuy(product)}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav 
        activeTab="markets" 
        onTabChange={(tab) => {
          const routes: Record<string, string> = {
            home: "/app/home",
            jobs: "/jobs",
            markets: "/stores",
            profile: "/profile",
          };
          if (routes[tab]) navigate(routes[tab]);
        }}
        onCreateClick={() => navigate("/create")}
      />
    </div>
  );
}
