import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/api/endpoints/bookings";
import { parseApiError } from "@/api/errors";
import {
  cardNumberRules,
  cvvRules,
  emailRules,
  expiryRules,
  fullNameRules,
  mobileRules,
} from "@/lib/validators";
import { ticketSummary } from "@/lib/seatRules";
import { formatPrice } from "@/lib/format";
import type { Order, SeatHold, Session, User } from "@/types";

type Form = {
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};
const FIELDS = ["fullName", "email", "mobileNumber", "cardNumber", "expiry", "cvv"];

type Props = {
  tabs: ReactNode;
  hold: SeatHold;
  session: Session;
  user: User;
  onPaid: (order: Order) => void;
  onConflict: (codes: string[]) => void;
  onExpired: (message: string) => void;
};

export function CheckoutStep({ tabs, hold, session, user, onPaid, onConflict, onExpired }: Props) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid },
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      fullName: user.fullName ?? "",
      email: user.email,
      mobileNumber: user.mobileNumber ?? "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  const pay = useMutation({
    mutationFn: (v: Form) => createOrder({ holdId: hold.holdId, ...v }),
    onSuccess: onPaid,
    onError: (e) => {
      if (e instanceof Error && e.message === "AuthCancelled") return;
      const err = parseApiError(e);
      if (err.status === 409) return onConflict(err.contested ?? []);
      if (err.status === 422 && !err.fieldErrors) return onExpired(err.message);
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([key, msgs]) => {
          if (FIELDS.includes(key)) setError(key as keyof Form, { message: msgs[0] });
          else setFormError(msgs[0]);
        });
        return;
      }
      setFormError(err.message);
    },
  });

  const onSubmit = (values: Form) => {
    if (pay.isPending) return; // rapid double clicks must not buy twice
    setFormError("");
    pay.mutate(values);
  };

  const field = (name: keyof Form) => ({
    error: errors[name]?.message,
    valid: touchedFields[name] && !errors[name],
  });

  const seatCodes = hold.seats.map((s) => s.code).join(", ");
  const tickets = ticketSummary(hold.seats.map((s) => s.ticketType.name));

  return (
    <>
      <div className="flex min-w-0 flex-col gap-4 pr-6">
        {tabs}
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            label="Full name"
            autoComplete="name"
            placeholder="e.g. Meri Sanikidze"
            {...field("fullName")}
            {...register("fullName", fullNameRules)}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="e.g. name@gmail.com"
              {...field("email")}
              {...register("email", emailRules)}
            />
            <FormField
              label="Mobile number"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 555 123 456"
              {...field("mobileNumber")}
              {...register("mobileNumber", mobileRules)}
            />
          </div>
          <div className="h-px bg-white/5" />
          <FormField
            label="Card number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="e.g. 1234 4567 8901 2345"
            {...field("cardNumber")}
            {...register("cardNumber", cardNumberRules)}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Expiry"
              autoComplete="cc-exp"
              placeholder="e.g. 12/34"
              maxLength={5}
              {...field("expiry")}
              {...register("expiry", expiryRules)}
            />
            <FormField
              label="CVV"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="e.g. 123"
              maxLength={3}
              {...field("cvv")}
              {...register("cvv", cvvRules)}
            />
          </div>
          {formError && (
            <p role="alert" className="text-body-s text-danger">
              {formError}
            </p>
          )}
        </form>
      </div>

      <aside className="flex flex-col border-l border-white/5 pl-6">
        <h3 className="text-label-m">Summary</h3>
        <div className="mt-3 rounded-xl bg-surface p-4">
          <p className="text-label-m uppercase">{session.movie.title}</p>
          <p className="text-body-s mt-1 text-muted">
            Hall {session.hall.name} · {format(parseISO(session.date), "EEE d MMM")} ·{" "}
            {session.time}
          </p>
          <div className="my-3 h-px bg-white/5" />
          <dl className="text-body-s flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Seats</dt>
              <dd className="text-label-s text-right">{seatCodes}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tickets</dt>
              <dd className="text-label-s text-right">{tickets}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-overline text-[11px]">Subtotal</span>
            <span className="text-h1">{formatPrice(hold.subtotal)}</span>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            className="w-full"
            loading={pay.isPending}
            disabled={!isValid}
          >
            Pay: Complete order
          </Button>
        </div>
      </aside>
    </>
  );
}
