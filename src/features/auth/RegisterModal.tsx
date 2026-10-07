import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { register as registerRequest } from "@/api/endpoints/auth";
import { parseApiError } from "@/api/errors";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";

type Form = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export function RegisterModal({ onClose }: { onClose: () => void }) {
  const open = useModalStore((s) => s.open);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    trigger,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<Form>({ mode: "onTouched" });

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type))
      return setAvatarError("Avatar must be a JPG, PNG or WEBP image");
    if (file.size > MAX_BYTES) return setAvatarError("Avatar must be 2MB or smaller");
    setAvatarError("");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: Form) => {
    setFormError("");
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    if (avatar) fd.append("avatar", avatar);
    try {
      const data = await registerRequest(fd);
      useAuthStore.getState().completeAuth(data);
    } catch (e) {
      const err = parseApiError(e);
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([k, msgs]) => {
          if (k === "avatar") setAvatarError(msgs[0]);
          else setError(k as keyof Form, { message: msgs[0] }); // e.g. username/email already taken
        });
      } else {
        setFormError(err.message);
      }
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-[475px]">
      <h2 className="text-h2">Sign up</h2>
      <p className="text-body-s mt-1 text-muted">Welcome to Kino XII</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload avatar"
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-muted"
          >
            {preview ? (
              <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
            ) : (
              "⬆"
            )}
          </button>
          <div>
            <p className="text-label-m">Upload avatar (optional)</p>
            <p className="text-body-s text-muted">JPG, PNG or WEBP</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hidden
            onChange={onFile}
          />
        </div>
        {avatarError && (
          <p role="alert" className="text-body-s -mt-3 text-danger">
            {avatarError}
          </p>
        )}

        <FormField
          label="Username"
          placeholder="User"
          autoComplete="username"
          error={errors.username?.message}
          valid={touchedFields.username && !errors.username}
          {...register("username", {
            required: "Username is required",
            minLength: { value: 3, message: "Username must be at least 3 characters" },
          })}
        />
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            valid={touchedFields.password && !errors.password}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 3, message: "Password must be at least 3 characters" },
              onChange: () =>
                touchedFields.password_confirmation && trigger("password_confirmation"),
            })}
          />
          <FormField
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            valid={touchedFields.password_confirmation && !errors.password_confirmation}
            {...register("password_confirmation", {
              required: "Please confirm your password",
              validate: (v) => v === getValues("password") || "Passwords do not match",
            })}
          />
        </div>

        {formError && (
          <p role="alert" className="text-body-s text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} disabled={!isValid} className="w-full">
          Sign up
        </Button>
      </form>

      <p className="text-body-s mt-5 text-center text-muted">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => open({ type: "login" })}
          className="text-btn text-primary hover:underline"
        >
          Log in
        </button>
      </p>
    </Modal>
  );
}
