import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import TokenSystem from "@/components/TokenSystem";
import JobsSection from "@/components/JobsSection";
import StoresSection from "@/components/StoresSection";
import DigitalAssets from "@/components/DigitalAssets";
import Community from "@/components/Community";
import Security from "@/components/Security";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <TokenSystem />
      <JobsSection />
      <StoresSection />
      <DigitalAssets />
      <Community />
      <Security />
      <Testimonials />
      <Stats />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
