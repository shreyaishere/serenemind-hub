import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addChat, clearChat, listChat, type ChatMsg } from "@/lib/api";

const SYSTEM = `You are Mindful, a warm, supportive wellness companion. You listen actively, validate feelings,
ask gentle open-ended questions, and offer evidence-based wellness suggestions (breathing, journaling, sleep hygiene,
small steps). You are NOT a therapist and you say so when relevant. If a user expresses crisis or self-harm intent,
you respond with care and direct them to the Emergency page or local crisis lines.`;

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = import.meta.env.VITE_AI_API_KEY as string | undefined;
  const provider = (import.meta.env.VITE_AI_PROVIDER as string | undefined) ?? "openai";
  if (!apiKey) throw new Error("Set VITE_AI_API_KEY in .env to enable the assistant.");
  const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      temperature: 0.8,
    }),
  });
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I'm here. Could you say a bit more?";
}

export default function AssistantPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    const { data } = await listChat();
    if (data) setMsgs(data as ChatMsg[]);
  };
  useEffect(() => { refresh(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!user || !input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const optimistic: ChatMsg = { id: crypto.randomUUID(), user_id: user.id, role: "user", content: text, created_at: new Date().toISOString() };
    setMsgs((m) => [...m, optimistic]);
    await addChat({ user_id: user.id, role: "user", content: text });

    try {
      const history = [...msgs, optimistic].slice(-20).map((m) => ({ role: m.role, content: m.content }));
      const reply = await callAI(history);
      await addChat({ user_id: user.id, role: "assistant", content: reply });
      setMsgs((m) => [...m, { id: crypto.randomUUID(), user_id: user.id, role: "assistant", content: reply, created_at: new Date().toISOString() }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assistant unavailable");
    } finally {
      setSending(false);
    }
  };

  const onClear = async () => {
    if (!user || !confirm("Clear this conversation?")) return;
    await clearChat(user.id);
    setMsgs([]);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
      <PageHeader
        icon={Sparkles}
        title="Wellness assistant"
        subtitle="A gentle companion — not a replacement for professional care."
        action={
          <Button variant="outline" onClick={onClear}><Trash2 className="h-4 w-4" /> Clear</Button>
        }
      />

      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-soft">
        {msgs.length === 0 && (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-[var(--primary)]" />
              <p className="mt-3">Share what's on your mind. I'll listen.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-muted text-foreground"
              }`}>{m.content}</div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder="Tell me how you're feeling…"
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 text-sm outline-none"
        />
        <Button type="submit" loading={sending} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
