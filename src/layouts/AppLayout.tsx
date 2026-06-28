import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, User, LogOut, Sparkles, Smile, BookHeart, Moon, Target, Activity, LifeBuoy,
  Brain, Wind, BarChart3, Users, Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mood", label: "Mood", icon: Smile },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/sleep", label: "Sleep", icon: Moon },
  { to: "/habits", label: "Habits", icon: Activity },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/meditate", label: "Meditate", icon: Brain },
  { to: "/breathing", label: "Breathing", icon: Wind },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
  { to: "/emergency", label: "Emergency", icon: LifeBuoy },
];

const footerNav = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 p-5 lg:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold tracking-tight">Mindful</div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}

          <div className="my-3 h-px bg-border" />

          {footerNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.user_metadata?.full_name ?? "Welcome"}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Mindful</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>
        <nav className="sticky bottom-0 z-10 flex items-center justify-around border-t border-border bg-card/80 p-2 backdrop-blur lg:hidden">
          {[nav[0], nav[1], nav[2], nav[8], footerNav[0]].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px]",
                  isActive ? "text-[var(--primary)]" : "text-muted-foreground",
                )
              }
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
