import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-surface rounded-xl shadow-soft border border-outline-variant/10",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";
