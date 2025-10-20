import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  variant?: "default" | "avatar" | "card" | "text";
}

export const Shimmer = ({ className, variant = "default" }: ShimmerProps) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]";
  
  const variantClasses = {
    default: "rounded-md",
    avatar: "rounded-full",
    card: "rounded-lg",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{
        animation: "shimmer 2s infinite linear",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export const ShimmerCard = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Shimmer className="h-48 w-full" variant="card" />
    <Shimmer className="h-4 w-3/4" variant="text" />
    <Shimmer className="h-4 w-1/2" variant="text" />
  </div>
);

export const ShimmerProfile = () => (
  <div className="flex items-center gap-3">
    <Shimmer className="w-12 h-12" variant="avatar" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-32" variant="text" />
      <Shimmer className="h-3 w-24" variant="text" />
    </div>
  </div>
);

export const ShimmerList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <ShimmerCard key={i} />
    ))}
  </div>
);
