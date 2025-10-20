import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Shimmer, ShimmerList } from "@/components/Shimmer";

export function TopupQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "info" | null>(null);
  const [tokensToCredit, setTokensToCredit] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    // @ts-ignore
    const { data } = await (supabase as any)
      .from("topup_requests")
      .select(`
        *,
        profiles:user_id (username, email, phone_number, kyc_status)
      `)
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const openAction = (request: any, type: "approve" | "reject" | "info") => {
    setSelectedRequest(request);
    setActionType(type);
    if (type === "approve") {
      setTokensToCredit(request.tokens_requested.toString());
    }
    setAdminNotes("");
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (actionType === "approve") {
        const tokens = parseFloat(tokensToCredit);
        const commission = selectedRequest.amount_sent - tokens;

        // Create ledger entry for user credit
        // @ts-ignore
        await (supabase as any).from("ledger_entries").insert({
          user_id: selectedRequest.user_id,
          type: "topup",
          amount: tokens,
          currency: "SLE",
          reference: `topup_request:${selectedRequest.id}`,
          metadata: {
            topup_request_id: selectedRequest.id,
            original_amount: selectedRequest.amount_sent,
            commission_taken: commission,
          },
          created_by: session.user.id,
        });

        // Create ledger entry for platform commission
        // @ts-ignore
        await (supabase as any).from("ledger_entries").insert({
          user_id: session.user.id,
          type: "fee",
          amount: commission,
          currency: "SLE",
          reference: `topup_commission:${selectedRequest.id}`,
          metadata: {
            topup_request_id: selectedRequest.id,
            commission_percent: (commission / selectedRequest.amount_sent) * 100,
          },
          created_by: session.user.id,
        });

        // Update user balance
        // @ts-ignore
        const { data: currentBalance } = await (supabase as any)
          .from("user_balances")
          .select("*")
          .eq("user_id", selectedRequest.user_id)
          .single();

        const newAvailable = parseFloat(currentBalance.available_balance || "0") + tokens;
        const newWithdrawable = parseFloat(currentBalance.withdrawable_balance || "0"); // Will be updated after hold period
        const newDeposited = parseFloat(currentBalance.total_deposited || "0") + tokens;

        // @ts-ignore
        await (supabase as any)
          .from("user_balances")
          .update({
            available_balance: newAvailable,
            withdrawable_balance: newWithdrawable,
            total_deposited: newDeposited,
          })
          .eq("user_id", selectedRequest.user_id);

        // Update topup request
        // @ts-ignore
        await (supabase as any)
          .from("topup_requests")
          .update({
            status: "approved",
            admin_id: session.user.id,
            admin_notes: adminNotes,
            tokens_credited: tokens,
            commission_taken: commission,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", selectedRequest.id);

        // Create notification
        // @ts-ignore
        await (supabase as any).from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: "topup_approved",
          title: "Top-Up Approved",
          message: `Your top-up of ${tokens.toFixed(2)} SLE has been approved and credited to your wallet.`,
          related_id: selectedRequest.id,
        });

        // Log audit
        // @ts-ignore
        await (supabase as any).from("audit_logs").insert({
          admin_id: session.user.id,
          action: "approve_topup",
          target_user_id: selectedRequest.user_id,
          target_table: "topup_requests",
          target_id: selectedRequest.id,
          details: {
            amount_sent: selectedRequest.amount_sent,
            tokens_credited: tokens,
            commission: commission,
            notes: adminNotes,
          },
        });

        toast({
          title: "Top-Up Approved",
          description: `${tokens.toFixed(2)} SLE credited to user`,
        });
      } else if (actionType === "reject") {
        // @ts-ignore
        await (supabase as any)
          .from("topup_requests")
          .update({
            status: "rejected",
            admin_id: session.user.id,
            admin_notes: adminNotes,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", selectedRequest.id);

        // Create notification
        // @ts-ignore
        await (supabase as any).from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: "topup_rejected",
          title: "Top-Up Rejected",
          message: `Your top-up request has been rejected. Reason: ${adminNotes}`,
          related_id: selectedRequest.id,
        });

        // Log audit
        // @ts-ignore
        await (supabase as any).from("audit_logs").insert({
          admin_id: session.user.id,
          action: "reject_topup",
          target_user_id: selectedRequest.user_id,
          target_table: "topup_requests",
          target_id: selectedRequest.id,
          details: {
            reason: adminNotes,
          },
        });

        toast({
          title: "Top-Up Rejected",
          description: "User has been notified",
        });
      } else if (actionType === "info") {
        // @ts-ignore
        await (supabase as any)
          .from("topup_requests")
          .update({
            status: "info_requested",
            admin_notes: adminNotes,
          })
          .eq("id", selectedRequest.id);

        // Create notification
        // @ts-ignore
        await (supabase as any).from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: "topup_info_requested",
          title: "More Information Needed",
          message: `Admin needs more information about your top-up request: ${adminNotes}`,
          related_id: selectedRequest.id,
        });

        toast({
          title: "Information Requested",
          description: "User has been notified",
        });
      }

      setSelectedRequest(null);
      setActionType(null);
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  if (loading) {
    return <ShimmerList count={3} />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending top-up requests
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        @{request.profiles?.username}
                        <Badge variant="outline">{request.profiles?.kyc_status}</Badge>
                      </CardTitle>
                      <CardDescription>{request.profiles?.email}</CardDescription>
                    </div>
                    <Badge>Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount Sent</p>
                      <p className="font-semibold">{request.amount_sent} SLE</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens Requested</p>
                      <p className="font-semibold">{request.tokens_requested} SLE</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Orange Money</p>
                      <p className="font-mono text-xs">{request.orange_phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-xs">{request.transaction_id || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="text-xs">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payout Number</p>
                      <p className="font-mono text-xs">{request.preferred_receive_number}</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm font-semibold mb-1">Notes:</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  )}

                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(request.screenshot_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Screenshot
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => openAction(request, "approve")}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openAction(request, "reject")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => openAction(request, "info")}
                      variant="outline"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="processed" className="space-y-4 mt-4">
          {processedRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>@{request.profiles?.username}</CardTitle>
                    <CardDescription>{request.profiles?.email}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold">{request.amount_sent} SLE</p>
                  </div>
                  {request.tokens_credited && (
                    <div>
                      <p className="text-muted-foreground">Tokens Credited</p>
                      <p className="font-semibold">{request.tokens_credited} SLE</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Admin Notes</p>
                    <p>{request.admin_notes || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Top-Up"}
              {actionType === "reject" && "Reject Top-Up"}
              {actionType === "info" && "Request More Information"}
            </DialogTitle>
            <DialogDescription>
              For @{selectedRequest?.profiles?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "approve" && (
              <div className="space-y-2">
                <Label>Tokens to Credit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={tokensToCredit}
                  onChange={(e) => setTokensToCredit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Original: {selectedRequest?.tokens_requested} SLE
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {actionType === "approve" && "Notes (optional)"}
                {actionType === "reject" && "Reason (required)"}
                {actionType === "info" && "Message to User"}
              </Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === "reject"
                    ? "Explain why this request is being rejected..."
                    : "Add any notes..."
                }
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setSelectedRequest(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={processing || (actionType === "reject" && !adminNotes)}
                className="flex-1"
                variant={actionType === "reject" ? "destructive" : "default"}
              >
                {processing ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
