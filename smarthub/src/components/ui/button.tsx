import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-label-md rounded-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          size === "sm" && "h-10 px-4",
          size === "md" && "h-12 px-6",
          size === "lg" && "h-14 px-8",
          variant === "primary" && "bg-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110",
          variant === "secondary" && "bg-secondary text-on-secondary hover:brightness-110",
          variant === "outline" && "border border-primary/20 text-primary bg-surface-container-highest hover:bg-surface-container",
          variant === "ghost" && "text-on-surface-variant hover:bg-surface-container",
          variant === "danger" && "bg-error text-on-error hover:brightness-110",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
