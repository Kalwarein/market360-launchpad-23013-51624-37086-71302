import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
}

export const WalletModal = ({ open, onOpenChange, balance }: WalletModalProps) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = () => {
    toast({
      title: "Deposit Initiated",
      description: `Depositing ${depositAmount} coins (Backend integration pending)`,
    });
    setDepositAmount("");
  };

  const handleBuy = () => {
    toast({
      title: "Purchase Initiated",
      description: `Buying ${buyAmount} coins (Backend integration pending)`,
    });
    setBuyAmount("");
  };

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawing ${withdrawAmount} coins (Backend integration pending)`,
    });
    setWithdrawAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            Wallet
          </DialogTitle>
          <DialogDescription>
            Manage your coins and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-8 h-8 text-primary" />
            {balance}
          </p>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="buy">Buy Coins</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">Amount to Deposit</Label>
              <Input
                id="deposit"
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleDeposit} className="w-full">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Deposit Coins
            </Button>
          </TabsContent>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy">Amount to Buy</Label>
              <Input
                id="buy"
                type="number"
                placeholder="Enter amount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleBuy} className="w-full" variant="secondary">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Coins
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw">Amount to Withdraw</Label>
              <Input
                id="withdraw"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balance}
              />
            </div>
            <Button onClick={handleWithdraw} className="w-full" variant="outline">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Withdraw Coins
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
