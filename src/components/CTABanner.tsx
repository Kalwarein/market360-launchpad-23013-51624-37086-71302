import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Coins, Sparkles } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Floating background elements */}
      <Coins className="absolute top-10 left-10 w-20 h-20 text-primary/10 animate-float" />
      <Sparkles className="absolute bottom-10 right-10 w-24 h-24 text-secondary/10 animate-float-delayed" />
      <Coins className="absolute top-40 right-40 w-16 h-16 text-primary/10 animate-float" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join Market360 today and be part of Sierra Leone's digital revolution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg text-lg px-8 py-6"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/signin">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
