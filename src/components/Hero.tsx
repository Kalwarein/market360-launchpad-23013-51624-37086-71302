import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag, Briefcase, Smartphone, Coins, Store, Handshake } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/30">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Floating Icons */}
      <Coins className="absolute top-20 left-10 w-12 h-12 text-primary opacity-20 animate-float" />
      <Smartphone className="absolute top-40 right-20 w-16 h-16 text-secondary opacity-20 animate-float-delayed" />
      <Store className="absolute bottom-40 left-20 w-14 h-14 text-primary opacity-20 animate-float" />
      <Briefcase className="absolute bottom-20 right-40 w-12 h-12 text-secondary opacity-20 animate-float-delayed" />
      <Handshake className="absolute top-60 right-60 w-16 h-16 text-primary opacity-15 animate-float" />
      <ShoppingBag className="absolute bottom-60 left-60 w-14 h-14 text-secondary opacity-15 animate-float-delayed" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          Empowering Sierra Leone Digitally
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in">
          Explore jobs, businesses, digital assets, and more — all in one trusted platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Link to="/signup">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
            >
              Sign Up
            </Button>
          </Link>
          <Link to="/signin">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
