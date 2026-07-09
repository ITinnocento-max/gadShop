"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CheckoutStepperProps {
  currentStep: number;
  className?: string;
}

const stepKeys = ["cart", "shipping", "payment", "review"];
const stepIcons: Record<string, string> = {
  cart: "shopping_cart",
  shipping: "local_shipping",
  payment: "payments",
  review: "rate_review",
};

export function CheckoutStepper({ currentStep, className }: CheckoutStepperProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("mb-xl overflow-x-auto", className)}>
      <div className="flex items-center justify-between min-w-[600px] max-w-2xl mx-auto px-md">
        {stepKeys.map((key, index) => (
          <Fragment key={key}>
            <div className="flex flex-col items-center gap-xs">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-label-sm",
                  index < currentStep && "bg-primary text-on-primary",
                  index === currentStep && "bg-secondary text-on-secondary",
                  index > currentStep && "bg-surface-container-highest text-on-surface-variant"
                )}
              >
                {index < currentStep ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "font-label-sm text-label-sm",
                  index <= currentStep && index === currentStep
                    ? "text-secondary"
                    : index < currentStep
                    ? "text-primary"
                    : "text-on-surface-variant"
                )}
              >
                {t(`stepper.${key}`)}
              </span>
            </div>
            {index < stepKeys.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-xs",
                  index < currentStep ? "bg-primary" : "bg-outline-variant"
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
