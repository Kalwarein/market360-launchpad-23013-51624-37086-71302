import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Home as HomeIcon, Briefcase, Store, User, Calendar, MapPin, DollarSign, Eye, Heart
} from "lucide-react";
import { Shimmer, ShimmerList } from "@/components/Shimmer";
import { toast } from "@/hooks/use-toast";

interface TabContentProps {
  activeTab: string;
  userId: string;
}

export const TabContent = ({ activeTab, userId }: TabContentProps) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "home") loadFeed();
    if (activeTab === "jobs") loadJobs();
    if (activeTab === "markets") loadStores();
    if (activeTab === "profile") loadProfile();
  }, [activeTab]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("posts")
        .select("*, profiles(username, profile_image_url, account_type)")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, profiles(username, account_type)")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("stores")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      console.error("Error loading stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-6">
        <ShimmerList count={3} />
      </div>
    );
  }

  // HOME TAB
  if (activeTab === "home") {
    return (
      <div className="space-y-4 py-6">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Market360</h2>
          <p className="text-muted-foreground mb-4">
            Your complete marketplace platform for Sierra Leone
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No posts yet. Start creating content!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        @{post.profiles?.username || "Unknown"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">View</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // JOBS TAB
  if (activeTab === "jobs") {
    return (
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Jobs & Gigs</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No jobs available yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>
                        By @{job.profiles?.username || "Unknown"}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {job.job_type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {job.salary_min && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{job.salary_min} SLE</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // MARKETS/STORES TAB
  if (activeTab === "markets") {
    return (
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Stores & Marketplace</h2>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No stores available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{store.name}</CardTitle>
                  <CardDescription>
                    By @{store.profiles?.username || "Unknown"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {store.description || "No description available"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button className="flex-1">Visit Store</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // PROFILE TAB
  if (activeTab === "profile") {
    return (
      <div className="space-y-6 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">@{profile?.username}</CardTitle>
                <CardDescription className="text-sm">
                  {profile?.account_type} account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Profile Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Email:</span> {profile?.email}</p>
                {profile?.phone_number && (
                  <p><span className="text-muted-foreground">Phone:</span> {profile.phone_number}</p>
                )}
                {profile?.city && (
                  <p><span className="text-muted-foreground">Location:</span> {profile.city}, {profile.country}</p>
                )}
              </div>
            </div>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
