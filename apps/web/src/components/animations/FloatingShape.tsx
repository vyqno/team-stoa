import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface FloatingShapeProps {
  size?: number;
  className?: string;
}

export const FloatingShape = memo(function FloatingShape({ size = 200, className }: FloatingShapeProps) {
  const duration = useMemo(() => 15 + Math.random() * 10, []);
  const delay = useMemo(() => Math.random() * -20, []);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn("absolute rounded-full bg-primary/10 pointer-events-none", className)}
      style={{
        width: size,
        height: size,
        animation: prefersReducedMotion ? "none" : `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
});
