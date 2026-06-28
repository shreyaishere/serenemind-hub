import { useEffect, useState } from "react";
import { Users, Heart, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow, parseISO } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { addPost, deletePost, listPosts, togglePostLike, type Post } from "@/lib/api";

const PSEUDONYMS = ["QuietRiver", "GentleMoon", "BraveSparrow", "WarmCedar", "SoftPebble", "OpenSky", "KindFern"];
const pick = () => PSEUDONYMS[Math.floor(Math.random() * PSEUDONYMS.length)];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [pseudonym, setPseudonym] = useState(pick());

  const refresh = async () => {
    const { data } = await listPosts();
    if (data) setPosts(data as Post[]);
  };
  useEffect(() => { refresh(); }, []);

  const onPost = async () => {
    if (!user || !content.trim()) return;
    const { error } = await addPost({ user_id: user.id, content: content.trim(), pseudonym });
    if (error) return toast.error(error.message);
    setContent("");
    refresh();
  };

  const onLike = async (id: string) => {
    if (!user) return;
    await togglePostLike(user.id, id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={Users} title="Community" subtitle="Share, anonymously — be gentle with each other." />

      <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>Posting as <span className="font-semibold text-foreground">@{pseudonym}</span></span>
          <button onClick={() => setPseudonym(pick())} className="text-[var(--primary)] hover:underline">change</button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your heart today?"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={onPost} disabled={!content.trim()}><Send className="h-4 w-4" /> Share</Button>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>@{p.pseudonym}</span>
              <span>{formatDistanceToNow(parseISO(p.created_at), { addSuffix: true })}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{p.content}</p>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => onLike(p.id)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-rose-500">
                <Heart className="h-4 w-4" /> {p.likes}
              </button>
              {user?.id === p.user_id && (
                <button onClick={async () => { await deletePost(p.id); refresh(); }} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {!posts.length && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Be the first to share.</div>}
      </div>
    </div>
  );
}
