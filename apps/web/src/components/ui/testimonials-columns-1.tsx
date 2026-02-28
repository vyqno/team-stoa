import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={props.className} role="list" aria-label="Testimonials">
      <motion.div
        animate={prefersReducedMotion ? {} : { translateY: "-50%" }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: props.duration || 10,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }
        }
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <article
                key={`${index}-${i}`}
                role="listitem"
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <blockquote className="font-body text-body-md text-card-foreground leading-relaxed">
                  &ldquo;{text}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={image}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-body text-body-sm font-semibold text-card-foreground">
                      {name}
                    </p>
                    <p className="font-body text-caption text-muted-foreground">
                      {role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
