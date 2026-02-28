import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}

export function StatCard({ icon: Icon, label, value, change, changeType = "neutral", className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-muted-foreground" />
        {change && (
          <span
            className={cn(
              "rounded-pill px-2 py-0.5 text-caption font-medium",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="font-display text-display-sm text-card-foreground">{value}</p>
    </div>
  );
}
