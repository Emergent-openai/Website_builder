import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(99,102,241,0.22)] hover:bg-primary/90 hover:shadow-[0_18px_34px_rgba(99,102,241,0.28)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_10px_24px_rgba(220,38,38,0.2)] hover:bg-destructive/90 hover:shadow-[0_16px_30px_rgba(220,38,38,0.26)]",
        outline:
          "border border-input shadow-[0_10px_22px_rgba(15,23,42,0.08)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_16px_28px_rgba(15,23,42,0.12)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_22px_rgba(15,23,42,0.08)] hover:bg-secondary/80 hover:shadow-[0_16px_28px_rgba(15,23,42,0.12)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
