import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, MapPin, DollarSign, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/app/AppHeader";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coinBalance, handleWalletClick } = useAppNavigation();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState<any>({});
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      // @ts-ignore
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select(`
          *,
          profiles:user_id (username, account_type, profile_image_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setJob(data);
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

  const handleApply = async () => {
    const applicationFee = job.application_fee || 2;
    
    if (coinBalance < applicationFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${applicationFee} SLE to apply for this job`,
        variant: "destructive",
      });
      return;
    }

    setShowApplicationModal(true);
  };

  const confirmApplication = async () => {
    setApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const applicationFee = job.application_fee || 2;

      // Deduct application fee
      // @ts-ignore
      const { data: balance } = await (supabase as any)
        .from("user_balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!balance || balance.balance < applicationFee) {
        throw new Error("Insufficient balance");
      }

      // @ts-ignore
      await (supabase as any)
        .from("user_balances")
        .update({ balance: balance.balance - applicationFee })
        .eq("user_id", user.id);

      // Create application
      // @ts-ignore
      const { error: appError } = await (supabase as any)
        .from("job_applications")
        .insert({
          job_id: id,
          applicant_id: user.id,
          cover_letter: applicationData.cover_letter,
          resume_url: applicationData.resume_url,
          custom_responses: applicationData.custom_responses || {},
        });

      if (appError) throw appError;

      // Record transaction
      // @ts-ignore
      await (supabase as any)
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "job_application",
          amount: applicationFee,
          token_amount: applicationFee,
          reference_id: id,
          reference_type: "job",
          description: `Application fee for ${job.title}`,
          status: "completed",
        });

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
      
      setShowApplicationModal(false);
      navigate("/jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
        <div className="container mx-auto px-4 py-24 text-center">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
        <div className="container mx-auto px-4 py-24 text-center">Job not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onWalletClick={handleWalletClick} coinBalance={coinBalance} />
      
      <main className="container mx-auto px-4 py-6 mt-16 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/jobs")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Posted by @{job.profiles?.username}</span>
                  <Badge variant="secondary">{job.profiles?.account_type}</Badge>
                </div>
              </div>
              <Badge className="text-lg px-4 py-2">{job.job_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary_min && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>{job.salary_min} - {job.salary_max} SLE</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>{job.applications_count} applications</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills_required && job.skills_required.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Application Fee</p>
                <p className="text-sm text-muted-foreground">
                  {job.application_fee || 2} SLE will be deducted from your balance upon applying
                </p>
              </div>
            </div>

            <Button onClick={handleApply} className="w-full" size="lg">
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover Letter *</Label>
              <Textarea
                id="cover_letter"
                rows={5}
                placeholder="Tell us why you're a great fit..."
                value={applicationData.cover_letter || ""}
                onChange={(e) => setApplicationData({...applicationData, cover_letter: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input
                id="resume_url"
                placeholder="https://..."
                value={applicationData.resume_url || ""}
                onChange={(e) => setApplicationData({...applicationData, resume_url: e.target.value})}
              />
            </div>

            {job.custom_fields && job.custom_fields.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Additional Requirements</h3>
                {job.custom_fields.map((field: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <Label>{field.label}</Label>
                    {field.type === "text" && (
                      <Input
                        placeholder={field.placeholder}
                        onChange={(e) => setApplicationData({
                          ...applicationData,
                          custom_responses: {
                            ...applicationData.custom_responses,
                            [field.label]: e.target.value
                          }
                        })}
                      />
                    )}
                    {field.type === "file" && (
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Handle file upload
                            setApplicationData({
                              ...applicationData,
                              custom_responses: {
                                ...applicationData.custom_responses,
                                [field.label]: file.name
                              }
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                By clicking "Confirm & Apply", {job.application_fee || 2} SLE will be deducted from your balance.
              </p>
              <p className="text-sm font-semibold mt-2">
                Current Balance: {coinBalance} SLE
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                className="flex-1"
                disabled={applying}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApplication}
                className="flex-1"
                disabled={applying || !applicationData.cover_letter}
              >
                {applying ? "Submitting..." : "Confirm & Apply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
