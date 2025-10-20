import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const withdrawSchema = z.object({
  requested_amount: z.number().min(50, "Minimum withdrawal is 50 SLE"),
  recipient_number: z.string().min(10, "Valid phone number required"),
  notes: z.string().optional(),
});

export default function WithdrawRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    requested_amount: "",
    recipient_number: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // Load balance
    // @ts-ignore
    const { data: balanceData } = await (supabase as any)
      .from("user_balances")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    setBalance(balanceData);

    // Load settings
    // @ts-ignore
    const { data: settingsData } = await (supabase as any)
      .from("system_settings")
      .select("*")
      .in("key", ["withdraw_fee_percent", "min_withdraw_amount", "max_withdraw_amount"]);

    const settingsMap: any = {};
    settingsData?.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });
    setSettings(settingsMap);

    // Load profile for default number
    // @ts-ignore
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("phone_number, preferred_receive_number")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setFormData(prev => ({
        ...prev,
        recipient_number: profile.preferred_receive_number || profile.phone_number || "",
      }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const withdrawFeePercent = parseFloat(settings.withdraw_fee_percent || "2");
  const minWithdraw = parseFloat(settings.min_withdraw_amount || "50");
  const maxWithdraw = parseFloat(settings.max_withdraw_amount || "50000");
  const withdrawableBalance = parseFloat(balance?.withdrawable_balance || "0");

  const requestedAmount = parseFloat(formData.requested_amount) || 0;
  const feeAmount = requestedAmount * (withdrawFeePercent / 100);
  const payoutAmount = requestedAmount - feeAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = withdrawSchema.parse({
        requested_amount: requestedAmount,
        recipient_number: formData.recipient_number,
        notes: formData.notes,
      });

      if (requestedAmount > withdrawableBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You can only withdraw up to ${withdrawableBalance.toFixed(2)} SLE`,
          variant: "destructive",
        });
        return;
      }

      if (requestedAmount < minWithdraw) {
        toast({
          title: "Amount Too Low",
          description: `Minimum withdrawal is ${minWithdraw} SLE`,
          variant: "destructive",
        });
        return;
      }

      if (requestedAmount > maxWithdraw) {
        toast({
          title: "Amount Too High",
          description: `Maximum withdrawal is ${maxWithdraw.toFixed(0)} SLE`,
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create withdrawal request
      // @ts-ignore
      const { error } = await (supabase as any)
        .from("withdraw_requests")
        .insert({
          user_id: session.user.id,
          requested_amount: validatedData.requested_amount,
          fee_amount: feeAmount,
          payout_amount: payoutAmount,
          recipient_number: validatedData.recipient_number,
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Withdrawal Request</h1>
            <p className="text-sm text-muted-foreground">Convert tokens to cash</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Available to Withdraw</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {withdrawableBalance.toFixed(2)} SLE
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Withdrawals are processed within 12 hours after admin approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>Enter the amount you want to withdraw</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requested_amount">Amount to Withdraw (SLE) *</Label>
                <Input
                  id="requested_amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.requested_amount}
                  onChange={(e) => handleChange("requested_amount", e.target.value)}
                  className={errors.requested_amount ? "border-destructive" : ""}
                  max={withdrawableBalance}
                />
                {errors.requested_amount && (
                  <p className="text-sm text-destructive">{errors.requested_amount}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min: {minWithdraw} SLE • Max: {maxWithdraw.toFixed(0)} SLE
                </p>
              </div>

              {requestedAmount > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Requested Amount:</span>
                      <span className="font-semibold">{requestedAmount.toFixed(2)} SLE</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Processing Fee ({withdrawFeePercent}%):</span>
                      <span className="font-semibold">-{feeAmount.toFixed(2)} SLE</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg">
                      <span className="font-bold">You will receive:</span>
                      <span className="font-bold text-primary">{payoutAmount.toFixed(2)} SLE</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="recipient_number">Orange Money Number *</Label>
                <Input
                  id="recipient_number"
                  type="tel"
                  placeholder="+232 76 123 456"
                  value={formData.recipient_number}
                  onChange={(e) => handleChange("recipient_number", e.target.value)}
                  className={errors.recipient_number ? "border-destructive" : ""}
                />
                {errors.recipient_number && (
                  <p className="text-sm text-destructive">{errors.recipient_number}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This is where you'll receive your payout
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Important Information:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Withdrawals are reviewed by admin before processing</li>
                        <li>Processing time: up to 12 hours after approval</li>
                        <li>Ensure your KYC information is up to date</li>
                        <li>Requests submitted within 12 hours of top-up may be delayed</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                  I confirm that my KYC information is valid and accurate. I understand that withdrawals are processed by admin and may take up to 12 hours.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !agreedToTerms || withdrawableBalance <= 0}
              >
                {loading ? "Submitting..." : "Submit Withdrawal Request"}
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
              <p>Your withdrawal request has been submitted for review.</p>
              <p className="font-semibold text-lg">
                You will receive: {payoutAmount.toFixed(2)} SLE
              </p>
              <p className="text-sm text-muted-foreground">
                To: {formData.recipient_number}
              </p>
              <p className="text-sm text-muted-foreground">
                Processing time: up to 12 hours after admin approval
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
