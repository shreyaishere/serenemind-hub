import { useEffect, useState } from "react";
import { LifeBuoy, Phone, Mail, Plus, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { addContact, deleteContact, listContacts, type Contact } from "@/lib/api";

const HOTLINES = [
  { country: "US / Canada", line: "988", note: "Suicide & Crisis Lifeline" },
  { country: "UK", line: "116 123", note: "Samaritans" },
  { country: "EU", line: "112", note: "Emergency services" },
  { country: "Global", line: "Visit findahelpline.com", note: "Find a local line" },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const refresh = async () => {
    const { data } = await listContacts();
    if (data) setContacts(data as Contact[]);
  };
  useEffect(() => { refresh(); }, []);

  const onAdd = async () => {
    if (!user || !name.trim()) return;
    const { error } = await addContact({ user_id: user.id, name, relation, phone, email });
    if (error) return toast.error(error.message);
    setName(""); setRelation(""); setPhone(""); setEmail("");
    refresh();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader icon={LifeBuoy} title="Emergency support" subtitle="You don't have to face this alone." />

      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">If you're in immediate danger, call your local emergency number now.</p>
            <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">Mindful is a supportive tool, not a crisis service.</p>
          </div>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {HOTLINES.map((h) => (
          <div key={h.country} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{h.country}</div>
            <div className="mt-1 text-2xl font-bold">{h.line}</div>
            <div className="text-sm text-muted-foreground">{h.note}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Your trusted contacts</h2>
        <p className="text-sm text-muted-foreground">People you can reach out to in tough moments.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Friend, family…" />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={onAdd}><Plus className="h-4 w-4" /> Add contact</Button>
        </div>

        <div className="mt-5 divide-y divide-border">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{c.name} {c.relation && <span className="text-xs text-muted-foreground">— {c.relation}</span>}</div>
                <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
                  {c.phone && <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-foreground"><Phone className="h-3.5 w-3.5" /> {c.phone}</a>}
                  {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="h-3.5 w-3.5" /> {c.email}</a>}
                </div>
              </div>
              <button onClick={async () => { await deleteContact(c.id); refresh(); }} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!contacts.length && <div className="py-4 text-center text-sm text-muted-foreground">No contacts added yet.</div>}
        </div>
      </section>
    </div>
  );
}
