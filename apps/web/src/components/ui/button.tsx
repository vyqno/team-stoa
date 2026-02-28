import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-pill hover:opacity-90 active:scale-[0.98] transition-opacity",
        dark:
          "bg-ink text-white rounded-pill hover:opacity-90 active:scale-[0.98] transition-opacity",
        destructive:
          "bg-destructive text-destructive-foreground rounded-pill hover:bg-destructive/90",
        outline:
          "border border-foreground bg-transparent text-foreground rounded-pill hover:bg-foreground hover:text-background",
        secondary:
          "bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80",
        ghost:
          "hover:bg-muted hover:text-foreground rounded-md",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8 py-2 text-body-sm",
        sm: "h-9 px-5 text-body-sm",
        lg: "h-14 px-10 text-body-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
