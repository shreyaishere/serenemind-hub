import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import toast from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { listSleep, upsertSleep, today, type Sleep } from "@/lib/api";

export default function SleepPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Sleep[]>([]);
  const [date, setDate] = useState(today());
  const [hours, setHours] = useState("7.5");
  const [quality, setQuality] = useState(4);
  const [note, setNote] = useState("");

  const refresh = async () => {
    const { data } = await listSleep(30);
    if (data) setLogs(data as Sleep[]);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onSave = async () => {
    if (!user) return;
    const h = parseFloat(hours);
    if (isNaN(h) || h < 0 || h > 24) return toast.error("Enter valid hours");
    const { error } = await upsertSleep({ user_id: user.id, date, hours: h, quality, note });
    if (error) return toast.error(error.message);
    toast.success("Sleep logged 💤");
    setNote("");
    refresh();
  };

  const chartData = logs.map((l) => ({ date: format(parseISO(l.date), "MMM d"), hours: l.hours, quality: l.quality ?? 0 }));
  const avg = logs.length ? (logs.reduce((s, l) => s + Number(l.hours), 0) / logs.length).toFixed(1) : "—";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader icon={Moon} title="Sleep" subtitle="Notice how rest shapes your days." />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Log a night</h2>
          <div className="mt-4 grid gap-4">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Hours slept" type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
            <div>
              <div className="mb-1.5 text-sm font-medium">Quality</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`h-10 flex-1 rounded-xl border text-sm font-semibold transition ${
                      quality === q
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dreams, wake-ups…" />
            <Button onClick={onSave}>Save night</Button>
          </div>
        </section>

        <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Last 30 days</h2>
            <div className="text-sm text-muted-foreground">
              Avg <span className="font-semibold text-foreground">{avg}h</span>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
