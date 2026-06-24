import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendPasswordReset(values.email);
      toast.success("Reset link sent — check your inbox");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries — we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {isSubmitSuccessful ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@email.com" {...register("email")} error={errors.email?.message} />
          <Button type="submit" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
