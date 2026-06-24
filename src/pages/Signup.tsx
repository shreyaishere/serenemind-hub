import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  fullName: z.string().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { signUpWithPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await signUpWithPassword(values.email, values.password, values.fullName);
      toast.success("Check your inbox to verify your email");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  const onGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign in failed");
    }
  };

  return (
    <AuthShell
      title="Create your space"
      subtitle="A calm, private home for your wellness journey."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="Alex Rivera" {...register("fullName")} error={errors.fullName?.message} />
        <Input label="Email" type="email" placeholder="you@email.com" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" onClick={onGoogle} className="w-full">
        <GoogleIcon className="h-4 w-4" /> Continue with Google
      </Button>
    </AuthShell>
  );
}
