import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { login } from "@/api/endpoints/auth";
import { parseApiError } from "@/api/errors";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";

type Form = { email: string; password: string };

export function LoginModal({ onClose }: { onClose: () => void }) {
  const open = useModalStore((s) => s.open);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Form>({ mode: "onTouched" });

  const onSubmit = async (values: Form) => {
    setFormError("");
    try {
      const data = await login(values);
      useAuthStore.getState().completeAuth(data); // closes modal, continues pending action
    } catch (e) {
      const err = parseApiError(e);
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([k, msgs]) =>
          setError(k as keyof Form, { message: msgs[0] }),
        );
      } else {
        setFormError(err.message); // e.g. "Invalid credentials." The modal stays open and the email is kept
      }
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-[403px]">
      <h2 className="text-h2">Log in</h2>
      <p className="text-body-s mt-1 text-muted">Welcome back to Kino XII</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-5">
        <FormField
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          autoComplete="email"
          error={errors.email?.message}
          valid={touchedFields.email && !errors.email}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email" },
          })}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          valid={touchedFields.password && !errors.password}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 3, message: "Password must be at least 3 characters" },
          })}
        />

        {formError && (
          <p role="alert" className="text-body-s text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} disabled={!isValid} className="w-full">
          Log in
        </Button>
      </form>

      <p className="text-body-s mt-5 text-center text-muted">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => open({ type: "register" })}
          className="text-btn text-primary hover:underline"
        >
          Sign up
        </button>
      </p>
    </Modal>
  );
}
