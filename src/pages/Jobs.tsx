import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function Jobs() {
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick, handleTabChange, handleCreateClick } = useAppNavigation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:user_id (username, account_type)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 pb-24 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Jobs & Freelancers</h1>
          <Button onClick={() => navigate("/jobs/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Post Job
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No jobs available yet
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by @{job.profiles?.username}
                      </p>
                    </div>
                    <Badge>{job.job_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    )}
                    {job.salary_min && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary_min} - {job.salary_max} SLE
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.applications_count} applications
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav 
        activeTab="jobs" 
        onTabChange={handleTabChange} 
        onCreateClick={handleCreateClick} 
      />
    </div>
  );
}
