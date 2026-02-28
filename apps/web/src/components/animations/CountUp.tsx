import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function CountUp({ end, prefix = "", suffix = "", decimals = 0, duration = 2000, className }: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setValue(eased * end);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, end, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn(className)}>
      {prefix}
      {value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      {suffix}
    </span>
  );
}
