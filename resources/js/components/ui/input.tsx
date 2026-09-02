import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-slate-200 file:text-foreground placeholder:text-slate-400 selection:bg-blue-600 selection:text-white flex h-11 w-full min-w-0 rounded-lg border bg-white px-3.5 py-1 text-base shadow-none transition-[color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-slate-700 dark:bg-slate-950/60 dark:placeholder:text-slate-500",
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/15 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
