import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function Profile() {
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick, handleTabChange, handleCreateClick } = useAppNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // @ts-ignore - Types will regenerate after migration
      const { data, error } = await (supabase as any)
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 mt-16">
        {/* Profile Banner */}
        <div className="relative mb-20">
          <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg" />
          
          <div className="absolute -bottom-16 left-8 flex items-end gap-4">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile?.profile_image_url} />
              <AvatarFallback className="text-4xl">
                {profile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="pb-2">
              <h1 className="text-2xl font-bold">@{profile?.username}</h1>
              <Badge>{profile?.account_type}</Badge>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-6">
          <p className="text-muted-foreground mb-2">
            {profile?.email}
          </p>
          {profile?.phone_number && (
            <p className="text-muted-foreground">
              {profile.phone_number}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1">Jobs</TabsTrigger>
            <TabsTrigger value="stores" className="flex-1">Stores</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <p>{post.content}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="jobs">
            <div className="text-center py-12 text-muted-foreground">
              Your posted jobs will appear here
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <div className="text-center py-12 text-muted-foreground">
              Your stores will appear here
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav 
        activeTab="home" 
        onTabChange={handleTabChange} 
        onCreateClick={handleCreateClick} 
      />
    </div>
  );
}
