import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Code, Image, FileText } from "lucide-react";

const assetExamples = [
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description: "Discover and download innovative local applications",
    count: "50+ Apps",
  },
  {
    icon: Code,
    title: "Software Tools",
    description: "Access productivity and business software solutions",
    count: "100+ Tools",
  },
  {
    icon: Image,
    title: "Creative Assets",
    description: "Graphics, templates, and design resources",
    count: "500+ Assets",
  },
  {
    icon: FileText,
    title: "Digital Content",
    description: "E-books, courses, and educational materials",
    count: "200+ Items",
  },
];

const DigitalAssets = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Digital Assets & Apps
          </h2>
          <p className="text-xl text-muted-foreground">
            Explore a world of digital products and creative resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assetExamples.map((asset, index) => {
            const Icon = asset.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-secondary/50 cursor-pointer group text-center"
              >
                <CardHeader>
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-secondary" />
                  </div>
                  <CardTitle className="text-lg font-bold">{asset.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{asset.description}</CardDescription>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {asset.count}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DigitalAssets;
