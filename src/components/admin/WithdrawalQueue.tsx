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
import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ShimmerList } from "@/components/Shimmer";

export function WithdrawalQueue() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [payoutReference, setPayoutReference] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    // @ts-ignore
    const { data } = await (supabase as any)
      .from("withdraw_requests")
      .select(`
        *,
        profiles:user_id (username, email, phone_number, kyc_status)
      `)
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const openAction = (request: any, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setPayoutReference("");
    setAdminNotes("");
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (actionType === "approve") {
        // Create ledger entry for withdrawal (debit user)
        // @ts-ignore
        await (supabase as any).from("ledger_entries").insert({
          user_id: selectedRequest.user_id,
          type: "withdraw_payout",
          amount: -selectedRequest.requested_amount,
          currency: "SLE",
          reference: `withdraw_request:${selectedRequest.id}`,
          metadata: {
            withdraw_request_id: selectedRequest.id,
            fee_amount: selectedRequest.fee_amount,
            payout_amount: selectedRequest.payout_amount,
            payout_reference: payoutReference,
          },
          created_by: session.user.id,
        });

        // Create ledger entry for platform fee
        // @ts-ignore
        await (supabase as any).from("ledger_entries").insert({
          user_id: session.user.id,
          type: "fee",
          amount: selectedRequest.fee_amount,
          currency: "SLE",
          reference: `withdraw_fee:${selectedRequest.id}`,
          metadata: {
            withdraw_request_id: selectedRequest.id,
            fee_percent: (selectedRequest.fee_amount / selectedRequest.requested_amount) * 100,
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

        const newAvailable = parseFloat(currentBalance.available_balance || "0") - selectedRequest.requested_amount;
        const newWithdrawable = parseFloat(currentBalance.withdrawable_balance || "0") - selectedRequest.requested_amount;
        const newWithdrawn = parseFloat(currentBalance.total_withdrawn || "0") + selectedRequest.payout_amount;

        // @ts-ignore
        await (supabase as any)
          .from("user_balances")
          .update({
            available_balance: newAvailable,
            withdrawable_balance: newWithdrawable,
            total_withdrawn: newWithdrawn,
          })
          .eq("user_id", selectedRequest.user_id);

        // Update withdrawal request
        // @ts-ignore
        await (supabase as any)
          .from("withdraw_requests")
          .update({
            status: "paid",
            admin_id: session.user.id,
            admin_notes: adminNotes,
            payout_reference: payoutReference,
            paid_at: new Date().toISOString(),
          })
          .eq("id", selectedRequest.id);

        // Create notification
        // @ts-ignore
        await (supabase as any).from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: "withdraw_approved",
          title: "Withdrawal Processed",
          message: `Your withdrawal of ${selectedRequest.payout_amount.toFixed(2)} SLE has been sent to ${selectedRequest.recipient_number}. Reference: ${payoutReference}`,
          related_id: selectedRequest.id,
        });

        // Log audit
        // @ts-ignore
        await (supabase as any).from("audit_logs").insert({
          admin_id: session.user.id,
          action: "approve_withdrawal",
          target_user_id: selectedRequest.user_id,
          target_table: "withdraw_requests",
          target_id: selectedRequest.id,
          details: {
            requested_amount: selectedRequest.requested_amount,
            payout_amount: selectedRequest.payout_amount,
            recipient: selectedRequest.recipient_number,
            payout_reference: payoutReference,
            notes: adminNotes,
          },
        });

        toast({
          title: "Withdrawal Approved",
          description: `${selectedRequest.payout_amount.toFixed(2)} SLE processed`,
        });
      } else if (actionType === "reject") {
        // @ts-ignore
        await (supabase as any)
          .from("withdraw_requests")
          .update({
            status: "rejected",
            admin_id: session.user.id,
            admin_notes: adminNotes,
          })
          .eq("id", selectedRequest.id);

        // Create notification
        // @ts-ignore
        await (supabase as any).from("notifications").insert({
          user_id: selectedRequest.user_id,
          type: "withdraw_rejected",
          title: "Withdrawal Rejected",
          message: `Your withdrawal request has been rejected. Reason: ${adminNotes}`,
          related_id: selectedRequest.id,
        });

        // Log audit
        // @ts-ignore
        await (supabase as any).from("audit_logs").insert({
          admin_id: session.user.id,
          action: "reject_withdrawal",
          target_user_id: selectedRequest.user_id,
          target_table: "withdraw_requests",
          target_id: selectedRequest.id,
          details: {
            reason: adminNotes,
          },
        });

        toast({
          title: "Withdrawal Rejected",
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
                No pending withdrawal requests
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
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Requested Amount</p>
                        <p className="text-2xl font-bold">{request.requested_amount} SLE</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Payout Amount</p>
                        <p className="text-2xl font-bold text-primary">{request.payout_amount.toFixed(2)} SLE</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fee</p>
                      <p className="font-semibold">{request.fee_amount.toFixed(2)} SLE</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recipient Number</p>
                      <p className="font-mono text-xs">{request.recipient_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="text-xs">{new Date(request.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">User Phone</p>
                      <p className="font-mono text-xs">{request.profiles?.phone_number}</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm font-semibold mb-1">User Notes:</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => openAction(request, "approve")}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve & Pay
                    </Button>
                    <Button
                      onClick={() => openAction(request, "reject")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
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
                    variant={request.status === "paid" ? "default" : "destructive"}
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Payout Amount</p>
                    <p className="font-semibold">{request.payout_amount.toFixed(2)} SLE</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recipient</p>
                    <p className="font-mono text-xs">{request.recipient_number}</p>
                  </div>
                  {request.payout_reference && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Payout Reference</p>
                      <p className="font-mono text-xs">{request.payout_reference}</p>
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
              {actionType === "approve" && "Approve & Process Withdrawal"}
              {actionType === "reject" && "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              For @{selectedRequest?.profiles?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "approve" && (
              <>
                <Card className="bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Send to:</span>
                      <span className="font-mono font-semibold">{selectedRequest?.recipient_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        {selectedRequest?.payout_amount.toFixed(2)} SLE
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Orange Money Transaction ID *</Label>
                  <Input
                    type="text"
                    placeholder="Enter transaction reference from Orange Money"
                    value={payoutReference}
                    onChange={(e) => setPayoutReference(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Send payment via Orange Money first, then enter the transaction ID here
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>
                {actionType === "approve" ? "Notes (optional)" : "Reason (required)"}
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
                disabled={
                  processing ||
                  (actionType === "approve" && !payoutReference) ||
                  (actionType === "reject" && !adminNotes)
                }
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
