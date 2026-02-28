import { cn } from "@/lib/utils";
import { Star, CheckCircle } from "lucide-react";

export interface AgentCardData {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerCall: number;
  rating: number;
  totalCalls?: number;
  verified?: boolean;
}

interface AgentCardProps {
  agent: AgentCardData;
  onClick?: () => void;
  className?: string;
}

export function AgentCard({ agent, onClick, className }: AgentCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer min-w-[280px] max-w-[340px]",
        className
      )}
    >
      {/* Initial + Verified */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-display text-xl font-bold text-primary">
          {agent.name.charAt(0)}
        </div>
        {agent.verified && (
          <CheckCircle className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Name */}
      <h3 className="font-body text-lg font-semibold text-card-foreground leading-tight">
        {agent.name}
      </h3>

      {/* Category Badge */}
      <span className="inline-flex w-fit items-center rounded-pill bg-primary/10 px-3 py-1 text-caption font-medium uppercase tracking-wider text-primary">
        {agent.category}
      </span>

      {/* Description */}
      <p className="text-body-sm text-muted-foreground line-clamp-2">
        {agent.description}
      </p>

      {/* Footer: Price + Rating */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-mono text-body-sm font-medium text-card-foreground">
          ${agent.pricePerCall.toFixed(2)}
          <span className="text-muted-foreground">/call</span>
        </span>
        <span className="flex items-center gap-1 text-body-sm text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          {agent.rating}
        </span>
      </div>
    </div>
  );
}
