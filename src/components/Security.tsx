import { Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const securityFeatures = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is protected with industry-leading encryption and security protocols.",
  },
  {
    icon: CheckCircle,
    title: "Verified Users",
    description: "All users and businesses go through our verification process for your safety.",
  },
  {
    icon: Lock,
    title: "Secure Transactions",
    description: "Every payment and transfer is encrypted and monitored for suspicious activity.",
  },
  {
    icon: AlertCircle,
    title: "Fraud Protection",
    description: "24/7 monitoring and instant alerts to keep your account safe from threats.",
  },
];

const Security = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Security & Trust
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your safety is our top priority. Trade with confidence on Market360.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 animate-pulse-slow">
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
      </div>
    </section>
  );
};

export default Security;
