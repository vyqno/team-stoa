import { cn } from "@/lib/utils";
import { ScrollReveal } from "./ScrollReveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface StaggerRevealProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function StaggerReveal({
  children,
  staggerDelay = 0.1,
  direction = "up",
  className,
}: StaggerRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn(className)}>
      {children.map((child, i) => (
        <ScrollReveal key={i} delay={prefersReducedMotion ? 0 : i * staggerDelay} direction={direction}>
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
