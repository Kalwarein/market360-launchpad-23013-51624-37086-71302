import { Wallet, ArrowUpCircle, ShoppingCart, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tokenFeatures = [
  {
    icon: Wallet,
    title: "Secure Wallet",
    description: "Your tokens are safe with bank-level security and encryption.",
  },
  {
    icon: ArrowUpCircle,
    title: "Easy Top-Up",
    description: "Add funds quickly through local payment methods.",
  },
  {
    icon: ShoppingCart,
    title: "Shop & Bid",
    description: "Use tokens for purchases and participate in bidding.",
  },
  {
    icon: ArrowDownCircle,
    title: "Fast Withdrawals",
    description: "Convert tokens to cash anytime with instant transfers.",
  },
];

const TokenSystem = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Token & Money System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and built for Sierra Leone's digital economy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tokenFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">100%</div>
            <div className="text-muted-foreground">Secure Transactions</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-secondary mb-2">Fast</div>
            <div className="text-muted-foreground">Instant Transfers</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">Local</div>
            <div className="text-muted-foreground">Sierra Leone First</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenSystem;
