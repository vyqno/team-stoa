import { cn } from "@/lib/utils";

export const BackgroundGlow = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 z-0", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--celery-light)) 0%, transparent 70%)`,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
};
