import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { WalletModal } from "@/components/app/WalletModal";
import { PostingModal } from "@/components/app/PostingModal";
import { FeedCard } from "@/components/app/FeedCard";
import { BusinessPanels } from "@/components/app/BusinessPanels";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockFeedData = [
  {
    type: "job" as const,
    title: "Senior React Developer",
    description: "We're looking for an experienced React developer to join our team. Must have 3+ years of experience with React, TypeScript, and modern web technologies.",
    author: "TechCorp SL",
    category: "Technology",
    featured: true,
  },
  {
    type: "store" as const,
    title: "Premium Coffee Beans",
    description: "Fresh roasted coffee beans from local farms. Perfect for espresso and pour-over brewing.",
    author: "Sierra Coffee Co",
    price: 50,
    category: "Food & Beverage",
  },
  {
    type: "asset" as const,
    title: "Website Template Pack",
    description: "Modern responsive website templates for businesses. Includes 10 templates with full source code.",
    author: "Digital Designs",
    price: 150,
    category: "Digital Assets",
  },
  {
    type: "blog" as const,
    title: "Growing Your Business in Sierra Leone",
    description: "Tips and strategies for entrepreneurs looking to scale their business in the local market.",
    author: "Business Insights SL",
    category: "Business",
  },
  {
    type: "job" as const,
    title: "Marketing Coordinator",
    description: "Join our marketing team to help drive brand awareness and customer engagement.",
    author: "Growth Agency",
    category: "Marketing",
  },
];

export default function AppHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [topFilter, setTopFilter] = useState("all");
  const [walletOpen, setWalletOpen] = useState(false);
  const [postingOpen, setPostingOpen] = useState(false);
  const [coinBalance] = useState(1250);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarding_completed) {
        navigate("/onboarding");
        return;
      }

      setUser(profile);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getTopFilters = () => {
    switch (activeTab) {
      case "jobs":
        return ["all", "my-jobs", "applied", "saved", "recommended"];
      case "markets":
        return ["all", "stores", "products", "digital-assets", "featured"];
      case "posts":
        return ["all", "my-posts", "drafts", "scheduled", "popular"];
      case "home":
        return ["all", "following", "trending", "recent", "popular"];
      default:
        return ["all"];
    }
  };

  const filteredFeed = mockFeedData.filter(item => {
    // First filter by main tab
    let tabMatch = true;
    if (activeTab === "jobs") tabMatch = item.type === "job";
    else if (activeTab === "markets") tabMatch = item.type === "store" || item.type === "asset";
    else if (activeTab === "posts") tabMatch = item.type === "blog";
    else if (activeTab === "home") tabMatch = true;
    
    // Then filter by top filter
    if (!tabMatch) return false;
    if (topFilter === "all") return true;
    
    // Additional filtering based on topFilter can be added here
    return true;
  });

  const isBusinessUser = user?.account_type !== "personal";

  const getTabTitle = () => {
    switch (activeTab) {
      case "jobs": return "Jobs";
      case "markets": return "Marketplace";
      case "posts": return "Posts & Content";
      case "home": return "Feed";
      default: return "Market360";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "jobs": return "Browse jobs, apply, and manage your applications";
      case "markets": return "Explore stores, products, and digital assets";
      case "posts": return "Create and manage your posts and content";
      case "home": return "Everything happening on Market360";
      default: return "Your marketplace for everything";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader onWalletClick={() => setWalletOpen(true)} coinBalance={coinBalance} />
      
      <main className="flex-1 pt-16 pb-20 overflow-y-auto">
        <div className="w-full">
          {/* Main Content Area */}
          <div className={`${isBusinessUser ? "flex gap-4 px-4" : "max-w-4xl mx-auto px-4"}`}>
            {/* Main Feed */}
            <div className={isBusinessUser ? "flex-1 min-w-0" : "w-full"}>
              {/* Header Section */}
              <div className="mb-4 pt-4">
                <h2 className="text-2xl font-bold mb-1">{getTabTitle()}</h2>
                <p className="text-sm text-muted-foreground">{getTabDescription()}</p>
              </div>

              {/* Top Filters */}
              {activeTab !== "create" && (
                <div className="mb-4 overflow-x-auto scrollbar-hide">
                  <Tabs value={topFilter} onValueChange={setTopFilter} className="w-full">
                    <TabsList className="inline-flex w-auto bg-muted/50">
                      {getTopFilters().map((filter) => (
                        <TabsTrigger 
                          key={filter} 
                          value={filter}
                          className="text-xs capitalize whitespace-nowrap"
                        >
                          {filter.replace("-", " ")}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Feed Content */}
              <div className="space-y-3">
                {filteredFeed.length > 0 ? (
                  filteredFeed.map((item, index) => (
                    <FeedCard key={index} {...item} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No content available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Panels */}
            {isBusinessUser && (
              <div className="w-80 shrink-0 pt-4 hidden lg:block">
                <BusinessPanels userType={user?.account_type} />
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCreateClick={() => setPostingOpen(true)}
      />

      <WalletModal
        open={walletOpen}
        onOpenChange={setWalletOpen}
        balance={coinBalance}
      />

      <PostingModal
        open={postingOpen}
        onOpenChange={setPostingOpen}
      />
    </div>
  );
}
