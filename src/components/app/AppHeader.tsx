import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onWalletClick: () => void;
  coinBalance: number;
}

export const AppHeader = ({ onWalletClick, coinBalance }: AppHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Market360
        </h1>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onWalletClick}
          className="flex items-center gap-2 hover:bg-primary/10 transition-all"
        >
          <Coins className="w-5 h-5 text-primary animate-pulse-slow" />
          <span className="font-semibold">{coinBalance}</span>
        </Button>
      </div>
    </header>
  );
};
