import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ScrollVelocityTickerProps {
  texts: string[];
  className?: string;
}

export function ScrollVelocityTicker({ texts, className }: ScrollVelocityTickerProps) {
  const content = texts.join(" \u2022 ") + " \u2022 ";
  const repeated = content.repeat(4);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)} aria-label={texts.join(", ")} role="marquee">
      <div className={cn("inline-block", !prefersReducedMotion && "animate-marquee")}>
        <span className="inline-block pr-4">{repeated}</span>
        <span className="inline-block pr-4" aria-hidden="true">{repeated}</span>
      </div>
    </div>
  );
}
