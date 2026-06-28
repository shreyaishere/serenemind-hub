import { Settings as SettingsIcon, Moon, Sun, LogOut, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Make Mindful your own." />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">Choose how Mindful looks.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              theme === "light" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-border hover:bg-muted"
            }`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              theme === "dark" ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-border hover:bg-muted"
            }`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">Account</h2>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user?.email}</span></div>
        <div className="mt-4">
          <Button variant="outline" onClick={onSignOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Privacy</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• All your wellness data is private and protected by row-level security.</li>
          <li>• Community posts use a pseudonym — your account stays hidden.</li>
          <li>• You can delete your data at any time from the Profile page.</li>
        </ul>
      </section>
    </div>
  );
}
