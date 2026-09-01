import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body text-label-md rounded-lg transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-level-1 hover:bg-primary/90 hover:shadow-level-2",
        secondary:
          "bg-surface-container text-on-surface border border-outline-variant/30 hover:bg-surface-container-high",
        forest: "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-level-1",
        outline:
          "border border-outline-variant/60 text-on-surface-variant bg-transparent hover:bg-surface-container-high/60",
        ghost: "text-on-surface-variant hover:bg-surface-container-high/60",
        danger: "bg-error text-on-error hover:bg-error/90",
      },
      size: {
        sm: "px-4 py-2 text-label-sm",
        md: "px-5 py-3",
        lg: "px-6 py-4",
        icon: "size-10 p-0 rounded-full",
        full: "w-full py-4",
      },
      pill: { true: "rounded-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", pill: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pill, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, pill }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
