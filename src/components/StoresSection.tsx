import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Package, MapPin } from "lucide-react";

const storeExamples = [
  {
    name: "Freetown Electronics",
    category: "Electronics & Gadgets",
    location: "Freetown",
    rating: 4.8,
    products: "500+ Products",
  },
  {
    name: "Fashion Boutique SL",
    category: "Clothing & Fashion",
    location: "Bo",
    rating: 4.9,
    products: "300+ Products",
  },
  {
    name: "Digital Marketplace",
    category: "Digital Products",
    location: "Online",
    rating: 4.7,
    products: "1000+ Products",
  },
];

const StoresSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Explore Stores & Marketplaces
          </h2>
          <p className="text-xl text-muted-foreground">
            Shop from trusted local and digital vendors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {storeExamples.map((store, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 cursor-pointer group"
            >
              <CardHeader>
                <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-4 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                  <Package className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{store.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{store.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{store.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{store.rating}</span>
                  <span className="text-muted-foreground">• {store.products}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
