import { Loader2 } from "lucide-react";

export function Loader({ full = false }: { full?: boolean }) {
  return (
    <div
      className={
        full
          ? "flex min-h-screen w-full items-center justify-center bg-background"
          : "flex items-center justify-center p-8"
      }
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
    </div>
  );
}
