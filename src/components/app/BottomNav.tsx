import { Home, Briefcase, Store, Plus, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateClick: () => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "jobs", label: "Jobs & Gigs", icon: Briefcase },
  { id: "create", label: "Create", icon: Plus },
  { id: "markets", label: "Markets", icon: Store },
  { id: "profile", label: "Profile", icon: User },
];

export const BottomNav = ({ activeTab, onTabChange, onCreateClick }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg">
      <div className="max-w-full px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCreate = tab.id === "create";
            
            return (
              <button
                key={tab.id}
                onClick={() => isCreate ? onCreateClick() : onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isCreate
                    ? "text-primary scale-110"
                    : isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isCreate ? "animate-pulse" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
