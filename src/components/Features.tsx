import { Store, Briefcase, Smartphone, Coins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Store,
    title: "Marketplace & Stores",
    description: "Browse local businesses, shops, and products. Support Sierra Leone entrepreneurs and discover quality goods.",
  },
  {
    icon: Briefcase,
    title: "Jobs & Freelancers",
    description: "Find full-time, part-time, and remote work opportunities. Connect with talented freelancers across industries.",
  },
  {
    icon: Smartphone,
    title: "Digital Assets & Apps",
    description: "Access creative digital products, applications, and services. Showcase your digital creations to the market.",
  },
  {
    icon: Coins,
    title: "Token & Money Features",
    description: "Secure transactions with our token system. Top up, bid, purchase, and withdraw with confidence.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Market360 brings together opportunities, commerce, and connections for Sierra Leone's digital economy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 relative overflow-hidden"
              >
                {/* Floating icon in background */}
                <Icon className="absolute -right-8 -top-8 w-40 h-40 text-primary/5 group-hover:text-primary/10 transition-colors duration-300 group-hover:rotate-12" />
                
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
