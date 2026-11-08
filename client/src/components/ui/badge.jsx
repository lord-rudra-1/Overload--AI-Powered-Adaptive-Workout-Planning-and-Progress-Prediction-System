import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-500/15 text-orange-400 border border-orange-500/30",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
        outline:
          "border-zinc-700 text-zinc-300",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        destructive:
          "border-transparent bg-red-500/15 text-red-400 border border-red-500/30",
        info:
          "border-transparent bg-blue-500/15 text-blue-400 border border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
