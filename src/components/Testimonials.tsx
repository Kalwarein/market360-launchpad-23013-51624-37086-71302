import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Aminata Kamara",
    role: "Small Business Owner",
    content: "Market360 transformed my business. I can now reach customers across Sierra Leone and manage everything from one platform.",
    rating: 5,
  },
  {
    name: "Mohamed Sesay",
    role: "Freelance Developer",
    content: "Finding remote work has never been easier. The platform connects me with clients and handles payments securely.",
    rating: 5,
  },
  {
    name: "Fatmata Conteh",
    role: "Digital Creator",
    content: "I love selling my digital products here. The token system makes transactions smooth, and the community is supportive.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground">
            Hear from our community members
          </p>
        </div>

        <div className="relative">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className={`transition-all duration-500 ${
                index === currentIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95 absolute top-0 left-0 right-0'
              } border-2 shadow-xl`}
            >
              <CardContent className="p-8 md:p-12 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg md:text-xl text-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-lg text-foreground">{testimonial.name}</p>
                  <p className="text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
