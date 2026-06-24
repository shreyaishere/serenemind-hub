import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePassword(values.password);
      toast.success("Password updated");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose something strong you'll remember.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="New password" type="password" {...register("password")} error={errors.password?.message} />
        <Input label="Confirm password" type="password" {...register("confirm")} error={errors.confirm?.message} />
        <Button type="submit" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
