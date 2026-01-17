import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-destructive/50 hover:scale-105",
        outline:
          "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary hover:shadow-lg hover:shadow-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 hover:shadow-secondary/50 hover:scale-105",
        ghost:
          "text-foreground hover:bg-muted hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline",
        cosmic:
          "relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] text-primary-foreground animate-shimmer shadow-lg hover:scale-105",
        glow:
          "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_hsl(190_100%_50%/0.5)] hover:shadow-[0_0_30px_hsl(190_100%_50%/0.8)] transition-all duration-300",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
