import { Users, MessageCircle, Network, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const communityFeatures = [
  {
    icon: Users,
    title: "Connect with Businesses",
    description: "Build relationships with local and international companies",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat and collaborate with professionals in real-time",
  },
  {
    icon: Network,
    title: "Professional Network",
    description: "Expand your network across industries and sectors",
  },
  {
    icon: Handshake,
    title: "Collaboration Opportunities",
    description: "Find partners and team up on projects",
  },
];

const Community = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Community & Networking
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Sierra Leone's largest professional and business community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {communityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-12 h-12 text-primary group-hover:text-secondary transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg text-lg px-8">
            Join the Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Community;
