import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const topupSchema = z.object({
  amount_sent: z.number().min(50, "Minimum top-up is 50 SLE"),
  orange_phone: z.string().min(10, "Valid Orange Money number required"),
  transaction_id: z.string().optional(),
  preferred_receive_number: z.string().min(10, "Valid phone number required"),
  notes: z.string().optional(),
});

export default function TopupRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [platformNumber, setPlatformNumber] = useState("");
  const [commission, setCommission] = useState(1);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount_sent: "",
    orange_phone: "",
    transaction_id: "",
    preferred_receive_number: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // @ts-ignore
    const { data } = await (supabase as any)
      .from("system_settings")
      .select("*")
      .in("key", ["platform_orange_number", "topup_commission_percent"]);

    data?.forEach((setting: any) => {
      if (setting.key === "platform_orange_number") {
        setPlatformNumber(setting.value);
      } else if (setting.key === "topup_commission_percent") {
        setCommission(parseFloat(setting.value));
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Screenshot must be under 5MB",
          variant: "destructive",
        });
        return;
      }
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!screenshot) {
      toast({
        title: "Screenshot required",
        description: "Please upload your Orange Money transaction screenshot",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = topupSchema.parse({
        amount_sent: parseFloat(formData.amount_sent),
        orange_phone: formData.orange_phone,
        transaction_id: formData.transaction_id,
        preferred_receive_number: formData.preferred_receive_number,
        notes: formData.notes,
      });

      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
        return;
      }

      // Upload screenshot
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("topup-screenshots")
        .upload(fileName, screenshot);

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("topup-screenshots")
        .getPublicUrl(fileName);

      // Create top-up request
      // @ts-ignore
      const { error } = await (supabase as any)
        .from("topup_requests")
        .insert({
          user_id: session.user.id,
          amount_sent: validatedData.amount_sent,
          tokens_requested: validatedData.amount_sent,
          orange_phone: validatedData.orange_phone,
          transaction_id: validatedData.transaction_id,
          screenshot_url: publicUrl,
          datetime_sent: new Date().toISOString(),
          preferred_receive_number: validatedData.preferred_receive_number,
          notes: validatedData.notes,
          status: "pending",
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const tokensToReceive = formData.amount_sent 
    ? parseFloat(formData.amount_sent) * (1 - commission / 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Top-Up Request</h1>
            <p className="text-sm text-muted-foreground">Add tokens to your wallet</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Step 1:</strong> Send money via Orange Money to:</p>
            <div className="bg-background p-3 rounded border">
              <p className="font-mono text-lg font-bold text-primary">{platformNumber || "+232 76 000 000"}</p>
            </div>
            <p><strong>Step 2:</strong> In the reference/note field, include:</p>
            <div className="bg-background p-2 rounded border">
              <code className="text-xs">TOPUP#{new Date().getTime().toString().slice(-6)}</code>
            </div>
            <p><strong>Step 3:</strong> Take a screenshot of the confirmation</p>
            <p><strong>Step 4:</strong> Fill out the form below and upload your screenshot</p>
            <p className="text-muted-foreground italic">
              💡 Your tokens will be credited within 12 hours after admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top-Up Details</CardTitle>
            <CardDescription>Enter your transaction information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount_sent">Amount Sent (SLE) *</Label>
                <Input
                  id="amount_sent"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.amount_sent}
                  onChange={(e) => handleChange("amount_sent", e.target.value)}
                  className={errors.amount_sent ? "border-destructive" : ""}
                />
                {errors.amount_sent && (
                  <p className="text-sm text-destructive">{errors.amount_sent}</p>
                )}
                {tokensToReceive > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You will receive: <strong>{tokensToReceive.toFixed(2)} tokens</strong> (Commission: {commission}%)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orange_phone">Your Orange Money Number *</Label>
                <Input
                  id="orange_phone"
                  type="tel"
                  placeholder="+232 76 123 456"
                  value={formData.orange_phone}
                  onChange={(e) => handleChange("orange_phone", e.target.value)}
                  className={errors.orange_phone ? "border-destructive" : ""}
                />
                {errors.orange_phone && (
                  <p className="text-sm text-destructive">{errors.orange_phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_id">Transaction ID (optional)</Label>
                <Input
                  id="transaction_id"
                  type="text"
                  placeholder="Copy from your Orange Money SMS"
                  value={formData.transaction_id}
                  onChange={(e) => handleChange("transaction_id", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_receive_number">
                  Payout Number (for future withdrawals) *
                </Label>
                <Input
                  id="preferred_receive_number"
                  type="tel"
                  placeholder="+232 76 123 456"
                  value={formData.preferred_receive_number}
                  onChange={(e) => handleChange("preferred_receive_number", e.target.value)}
                  className={errors.preferred_receive_number ? "border-destructive" : ""}
                />
                {errors.preferred_receive_number && (
                  <p className="text-sm text-destructive">{errors.preferred_receive_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot Upload *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="screenshot" className="cursor-pointer">
                    {previewUrl ? (
                      <div>
                        <img
                          src={previewUrl}
                          alt="Screenshot preview"
                          className="max-h-48 mx-auto rounded mb-2"
                        />
                        <p className="text-sm text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload screenshot</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit Top-Up Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">Request Submitted!</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>Your top-up request has been submitted for admin review.</p>
              <p className="font-semibold">
                Expected tokens: {tokensToReceive.toFixed(2)} SLE
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification once approved. Tokens will be available within 12 hours.
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => navigate("/wallet")} className="w-full">
            Back to Wallet
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
