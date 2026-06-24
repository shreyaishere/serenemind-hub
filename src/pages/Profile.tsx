import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { User as UserIcon, Upload, Trash2, KeyRound } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "Required").max(80),
  age: z.coerce.number().int().min(13).max(120).optional().or(z.literal("")),
  gender: z.string().max(40).optional().or(z.literal("")),
  occupation: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  wellness_goals: z.string().max(500).optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({ password: z.string().min(8), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export default function Profile() {
  const { user, updatePassword, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const pwdForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (!user || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) {
        toast.error("Could not load profile");
      } else if (data) {
        reset({
          full_name: data.full_name ?? "",
          age: data.age ?? "",
          gender: data.gender ?? "",
          occupation: data.occupation ?? "",
          bio: data.bio ?? "",
          wellness_goals: data.wellness_goals ?? "",
        });
        setAvatarUrl(data.avatar_url ?? null);
      } else {
        reset({ full_name: (user.user_metadata?.full_name as string) ?? "" });
      }
      setLoading(false);
    })();
  }, [user, reset]);

  const onSubmit = async (values: ProfileForm) => {
    if (!user) return;
    const payload = {
      id: user.id,
      full_name: values.full_name,
      age: values.age === "" ? null : values.age,
      gender: values.gender || null,
      occupation: values.occupation || null,
      bio: values.bio || null,
      wellness_goals: values.wellness_goals || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Avatar uploaded — remember to save");
    }
    setUploading(false);
  };

  const onPassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await updatePassword(values.password);
      toast.success("Password updated");
      pwdForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete your account data? This removes your profile row. Auth user removal requires admin access.")) return;
    if (!user) return;
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) return toast.error(error.message);
    await signOut();
    toast.success("Account data removed");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-1 text-muted-foreground">Help us personalize your wellness experience.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">
                <UserIcon className="h-7 w-7" />
              </div>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload avatar"}
            <input type="file" accept="image/*" hidden onChange={onAvatar} disabled={uploading} />
          </label>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Full name" {...register("full_name")} error={errors.full_name?.message} />
          <Input label="Age" type="number" {...register("age")} error={errors.age?.message as string | undefined} />
          <Input label="Gender" {...register("gender")} />
          <Input label="Occupation" {...register("occupation")} />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full rounded-xl border border-border bg-[var(--input)]/40 p-3 text-sm outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30"
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium">Wellness goals</label>
            <textarea
              {...register("wellness_goals")}
              rows={3}
              placeholder="Be kinder to myself, sleep 8 hours, meditate daily…"
              className="w-full rounded-xl border border-border bg-[var(--input)]/40 p-3 text-sm outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/30"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={isSubmitting}>Save profile</Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">Change password</h2>
        </div>
        <form onSubmit={pwdForm.handleSubmit(onPassword)} className="grid gap-4 sm:grid-cols-2">
          <Input label="New password" type="password" {...pwdForm.register("password")} error={pwdForm.formState.errors.password?.message} />
          <Input label="Confirm password" type="password" {...pwdForm.register("confirm")} error={pwdForm.formState.errors.confirm?.message} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={pwdForm.formState.isSubmitting}>Update password</Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="mb-2 flex items-center gap-2 text-red-500">
          <Trash2 className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Danger zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">Remove all your profile data. This signs you out.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={onDelete} className="border-red-500/40 text-red-500 hover:bg-red-500/10">
            Delete my data
          </Button>
        </div>
      </section>
    </div>
  );
}
