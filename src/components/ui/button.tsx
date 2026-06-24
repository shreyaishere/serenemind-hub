import { cn } from "@/lib/utils";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: BtnProps) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft hover:opacity-90"
      : variant === "outline"
        ? "border border-border bg-card text-foreground hover:bg-muted"
        : "text-foreground hover:bg-muted";
  return (
    <button className={cn(base, styles, className)} disabled={disabled || loading} {...rest}>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
