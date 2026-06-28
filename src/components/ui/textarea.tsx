import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className, ...rest }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        "min-h-[96px] w-full rounded-xl border border-border bg-[var(--input)]/40 p-3 text-sm outline-none transition placeholder:text-muted-foreground/70",
        "focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30",
        error && "border-red-500/60",
        className,
      )}
      {...rest}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));
Textarea.displayName = "Textarea";
