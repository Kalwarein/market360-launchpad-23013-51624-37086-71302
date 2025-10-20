import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCoinBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWalletClick = () => {
    navigate("/wallet");
  };

  const handleTabChange = (tab: string) => {
    const routes: Record<string, string> = {
      home: "/app/home",
      jobs: "/jobs",
      markets: "/stores",
      posts: "/community",
    };
    if (routes[tab]) {
      navigate(routes[tab]);
    }
  };

  const handleCreateClick = () => {
    navigate("/profile");
  };

  return {
    coinBalance,
    handleWalletClick,
    handleTabChange,
    handleCreateClick,
    refreshBalance: fetchBalance,
  };
};
