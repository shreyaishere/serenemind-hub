import { useEffect, useState } from "react";
import { BookHeart, Trash2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { addJournal, deleteJournal, listJournals, quickSentiment, type Journal } from "@/lib/api";

const PROMPTS = [
  "What's one small thing you're grateful for today?",
  "What drained you today, and what restored you?",
  "If today had a color, what would it be and why?",
  "What would you tell a friend going through what you're feeling?",
  "Name three things you noticed with your senses today.",
];

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Journal[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const { data } = await listJournals();
    if (data) setEntries(data as Journal[]);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onSave = async () => {
    if (!user || !content.trim()) return toast.error("Write something first");
    setSaving(true);
    const sentiment = quickSentiment(content);
    const { error } = await addJournal({ user_id: user.id, title: title || null as any, content, sentiment });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved to your journal");
    setTitle("");
    setContent("");
    refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await deleteJournal(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader icon={BookHeart} title="Journal" subtitle="A safe, private space for your thoughts." />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" /> Prompt
            </div>
            <button
              onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              New prompt
            </button>
          </div>
          <p className="mt-2 text-base italic text-foreground">"{prompt}"</p>

          <div className="mt-4 flex flex-col gap-4">
            <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A few words…" />
            <Textarea
              label="Entry"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Let it flow…"
              className="min-h-[220px]"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
              <Button onClick={onSave} loading={saving}>Save entry</Button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Past entries</h2>
          <div className="mt-3 max-h-[600px] space-y-3 overflow-auto pr-1">
            {entries.map((e) => (
              <div key={e.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{e.title || "Untitled"}</div>
                    <div className="text-[11px] text-muted-foreground">{format(parseISO(e.created_at), "PPP")}</div>
                  </div>
                  <button onClick={() => onDelete(e.id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{e.content}</p>
                {e.sentiment && (
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] ${
                      e.sentiment === "positive"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : e.sentiment === "negative"
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.sentiment}
                  </span>
                )}
              </div>
            ))}
            {!entries.length && <div className="py-8 text-center text-sm text-muted-foreground">Your first entry awaits.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
