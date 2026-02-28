import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/mock-data";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-6",
        className
      )}
    >
      {/* Quote */}
      <p className="font-body text-body-md italic text-card-foreground leading-relaxed">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="mt-auto flex items-center gap-3 pt-2">
        {/* Avatar fallback with initials */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-body text-body-sm font-semibold text-primary">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-body text-body-sm font-semibold text-card-foreground">
            {testimonial.name}
          </p>
          <p className="font-body text-caption text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}
