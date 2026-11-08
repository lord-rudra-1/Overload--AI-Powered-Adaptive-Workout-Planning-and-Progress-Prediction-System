import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, name = "User", ...props }) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-600 font-semibold text-white items-center justify-center text-xs shadow-inner",
        className
      )}
      {...props}
    >
      <span>{initials}</span>
    </div>
  );
}

export { Avatar };
