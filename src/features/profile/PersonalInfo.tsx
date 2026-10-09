import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { updateProfile } from "@/api/endpoints/profile";
import { parseApiError } from "@/api/errors";
import { useAuthStore } from "@/stores/authStore";
import { dobRules, fullNameRules, mobileRules } from "@/lib/validators";
import { cn } from "@/lib/cn";
import type { User } from "@/types";
import { today } from "@/lib/date";

const TODAY = today();
type Form = {
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  preferredVenueId: string;
};

const FIELDS = ["fullName", "mobileNumber", "dateOfBirth", "preferredVenueId"];
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export function PersonalInfo({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const options = useFilterOptions();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, touchedFields, isDirty, isValid },
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      fullName: user.fullName ?? "",
      mobileNumber: user.mobileNumber ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      preferredVenueId: user.preferredVenue ? String(user.preferredVenue.id) : "",
    },
  });

  const save = useMutation({
    mutationFn: (fd: FormData) => updateProfile(fd),
    onSuccess: (updated) => {
      setUser(updated); // the server's version, not a local patch
      reset({
        fullName: updated.fullName ?? "",
        mobileNumber: updated.mobileNumber ?? "",
        dateOfBirth: updated.dateOfBirth ?? "",
        preferredVenueId: updated.preferredVenue ? String(updated.preferredVenue.id) : "",
      });
      setAvatar(null);
      setSaved(true);
    },
    onError: (e) => {
      if (e instanceof Error && e.message === "AuthCancelled") return;
      const err = parseApiError(e);
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([key, msgs]) => {
          if (FIELDS.includes(key)) setError(key as keyof Form, { message: msgs[0] });
          else if (key === "avatar") setAvatarError(msgs[0]);
          else setFormError(msgs[0]);
        });
      } else {
        setFormError(err.message);
      }
    },
  });

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type))
      return setAvatarError("Avatar must be a JPG, PNG or WEBP image");
    if (file.size > MAX_BYTES) return setAvatarError("Avatar must be 2MB or smaller");
    setAvatarError("");
    setSaved(false);
    if (preview) URL.revokeObjectURL(preview);
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (v: Form) => {
    if (save.isPending) return;
    setFormError("");
    setSaved(false);
    const fd = new FormData();
    fd.append("_method", "PUT"); // some Laravel setups ignore fields on a multipart PUT
    fd.append("fullName", v.fullName);
    fd.append("mobileNumber", v.mobileNumber);
    fd.append("dateOfBirth", v.dateOfBirth);
    if (v.preferredVenueId) fd.append("preferredVenueId", v.preferredVenueId);
    if (avatar) fd.append("avatar", avatar);
    save.mutate(fd);
  };

  const field = (name: keyof Form) => ({
    error: errors[name]?.message,
    valid: touchedFields[name] && !errors[name],
  });

  const ageNote =
    user.age === null
      ? null
      : user.age >= 18
        ? `You are ${user.age}, you can buy tickets for all age ratings.`
        : user.age >= 16
          ? `You are ${user.age}, you cannot buy tickets for 18+ titles.`
          : `You are ${user.age}, you cannot buy tickets for 16+ or 18+ titles.`;

  const avatarSrc = preview ?? user.avatar;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex max-w-[520px] flex-col gap-5"
    >
      <div
        className={cn(
          "text-label-m rounded-xl px-4 py-3",
          user.profileComplete ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
        )}
      >
        {user.profileComplete
          ? "Profile Complete ✓"
          : "Please complete your profile to enable booking."}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Change avatar"
          className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-surface text-label-m"
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.fullName || user.username).slice(0, 2).toUpperCase()
          )}
        </button>
        <div>
          <p className="text-label-m">{user.username}</p>
          <p className="text-body-s text-muted">JPG, PNG or WEBP, up to 2MB</p>
        </div>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={onFile} />
      </div>
      {avatarError && (
        <p role="alert" className="text-body-s -mt-3 text-danger">
          {avatarError}
        </p>
      )}

      <FormField
        label="Full name"
        placeholder="e.g. Meri Sanikidze"
        {...field("fullName")}
        {...register("fullName", fullNameRules)}
      />
      <FormField label="Email" value={user.email} disabled readOnly />
      <FormField
        label="Mobile number"
        inputMode="tel"
        placeholder="e.g. 555 123 456"
        {...field("mobileNumber")}
        {...register("mobileNumber", mobileRules)}
      />
      <FormField
        label="Date of birth"
        type="date"
        max={TODAY}
        {...field("dateOfBirth")}
        {...register("dateOfBirth", dobRules)}
      />
      {ageNote && <p className="text-body-s -mt-3 text-muted">{ageNote}</p>}

      <div className="flex flex-col gap-2">
        <label htmlFor="preferred-venue" className="text-label-m">
          Preferred venue <span className="text-muted">(optional)</span>
        </label>
        <select
          id="preferred-venue"
          {...register("preferredVenueId")}
          className="text-body-m h-11 rounded-xl bg-surface px-4 text-white outline-none"
        >
          <option value="">No preference</option>
          {options.data?.venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.city}
            </option>
          ))}
        </select>
      </div>

      {formError && (
        <p role="alert" className="text-body-s text-danger">
          {formError}
        </p>
      )}
      {saved && (
        <p role="status" className="text-body-s text-success">
          Changes saved.
        </p>
      )}

      <Button
        type="submit"
        className="w-fit"
        loading={save.isPending}
        disabled={(!isDirty && !avatar) || !isValid}
      >
        Save changes
      </Button>
    </form>
  );
}
