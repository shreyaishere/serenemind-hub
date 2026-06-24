import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-[var(--input)]/40 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70",
          "focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30",
          error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
          className,
        )}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
Input.displayName = "Input";
