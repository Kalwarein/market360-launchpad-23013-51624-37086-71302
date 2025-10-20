import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { toast } from "@/hooks/use-toast";

export default function Wallet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/signin");
      return;
    }

    // Load balance
    // @ts-ignore - Types will regenerate after migration
    const { data: balanceData } = await (supabase as any)
      .from("user_balances")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    setBalance(balanceData);

    // Load system settings
    // @ts-ignore - Types will regenerate after migration
    const { data: settingsData } = await (supabase as any)
      .from("system_settings")
      .select("*");

    const settingsMap: any = {};
    settingsData?.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });
    setSettings(settingsMap);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Shimmer className="h-48 w-full mb-4" />
        <Shimmer className="h-96 w-full" />
      </div>
    );
  }

  const availableBalance = parseFloat(balance?.available_balance || "0");
  const withdrawableBalance = parseFloat(balance?.withdrawable_balance || "0");
  const totalDeposited = parseFloat(balance?.total_deposited || "0");
  const totalWithdrawn = parseFloat(balance?.total_withdrawn || "0");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Wallet</h1>
            <p className="text-sm text-muted-foreground">Manage your tokens</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-8">
        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/20 to-secondary/20">
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <WalletIcon className="w-8 h-8" />
              {availableBalance.toFixed(2)} SLE
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Withdrawable</p>
              <p className="font-semibold">{withdrawableBalance.toFixed(2)} SLE</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Deposited</p>
              <p className="font-semibold">{totalDeposited.toFixed(2)} SLE</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="topup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="topup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-primary" />
                  Buy Tokens
                </CardTitle>
                <CardDescription>
                  Add funds to your wallet via Orange Money
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate("/topup/request")}
                >
                  Start Top-Up Process
                </Button>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Commission: {settings.topup_commission_percent || "1"}%
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-primary" />
                  Request Withdrawal
                </CardTitle>
                <CardDescription>
                  Convert tokens back to cash
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate("/withdraw/request")}
                  disabled={withdrawableBalance <= 0}
                >
                  {withdrawableBalance > 0 ? "Request Withdrawal" : "No Balance"}
                </Button>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Fee: {settings.withdraw_fee_percent || "2"}% • Min: {settings.min_withdraw_amount || "50"} SLE
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Transaction history will be implemented in Phase 2
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
