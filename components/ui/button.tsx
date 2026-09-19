import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary-blue text-white hover:bg-primary-blue-hover": variant === "default",
            "bg-danger text-white hover:bg-danger/90": variant === "destructive",
            "border border-border-dark bg-transparent hover:bg-white/5 text-text-main": variant === "outline",
            "bg-white/10 text-text-main hover:bg-white/20": variant === "secondary",
            "hover:bg-white/5 hover:text-text-main": variant === "ghost",
            "text-primary-blue underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-full px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
