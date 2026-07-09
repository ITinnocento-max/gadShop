"use client";

import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  initialSeconds?: number;
  className?: string;
}

export function CountdownTimer({
  initialSeconds = 9912,
  className,
}: CountdownTimerProps) {
  const { hours, minutes, seconds } = useCountdown(initialSeconds);

  return (
    <div
      className={cn(
        "flex gap-1 items-center bg-error-container text-on-error-container px-2 py-0.5 rounded-lg font-label-sm",
        className
      )}
    >
      <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
    </div>
  );
}
