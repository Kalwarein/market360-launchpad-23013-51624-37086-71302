import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { PostingModal } from "@/components/app/PostingModal";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function Community() {
  const { coinBalance, handleWalletClick, handleTabChange, handleCreateClick } = useAppNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, profile_image_url, account_type)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
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

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        post_id: postId,
      });

      if (error) throw error;
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Community</h1>
          <Button onClick={() => setShowPostModal(true)}>
            Create Post
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No posts yet. Be the first to post!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={post.profiles?.profile_image_url} />
                      <AvatarFallback>
                        {post.profiles?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">@{post.profiles?.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4">{post.content}</p>

                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Post"
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-muted-foreground">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Heart className="h-5 w-5" />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary">
                      <Share2 className="h-5 w-5" />
                      <span>{post.shares_count || 0}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PostingModal 
        open={showPostModal} 
        onOpenChange={setShowPostModal}
      />

      <BottomNav 
        activeTab="posts" 
        onTabChange={handleTabChange} 
        onCreateClick={handleCreateClick} 
      />
    </div>
  );
}
