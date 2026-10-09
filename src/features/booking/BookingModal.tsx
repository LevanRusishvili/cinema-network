import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getSeatMap, getSession } from "@/api/endpoints/sessions";
import { createHold, releaseHold } from "@/api/endpoints/bookings";
import { parseApiError } from "@/api/errors";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuthStore } from "@/stores/authStore";
import { seatViolations, subtotalOf, type SelectedSeat } from "@/lib/seatRules";
import { cn } from "@/lib/cn";
import { SeatGrid, type SeatStatus } from "./SeatGrid";
import { SeatsPanel } from "./SeatsPanel";
import { CheckoutStep } from "./CheckoutStep";
import { Confirmation } from "./Confirmation";
import type { Order, Seat, SeatHold } from "@/types";

const EXPIRED = "Your hold time expired. Please re-select your seats.";
const SIZE = "max-w-[1100px]";

function StepTabs({ step, onSeats }: { step: 1 | 2; onSeats: () => void }) {
  const base =
    "flex h-9 flex-1 items-center justify-center rounded-full text-[11px] font-extrabold uppercase";
  return (
    <div className="flex rounded-full bg-surface">
      <button
        type="button"
        disabled={step === 1}
        aria-current={step === 1 ? "step" : undefined}
        onClick={onSeats}
        className={cn(
          base,
          step === 1 ? "bg-primary" : "cursor-pointer text-white/80 hover:text-white",
        )}
      >
        Seats
      </button>
      <div
        aria-current={step === 2 ? "step" : undefined}
        className={cn(base, step === 2 && "bg-primary")}
      >
        Checkout
      </div>
    </div>
  );
}

function HoldBadge({ seconds, fallback }: { seconds: number | null; fallback: string }) {
  const text =
    seconds === null
      ? fallback
      : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div className="rounded-xl bg-surface px-3 py-1.5 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">Seats held</p>
      <p
        className={cn(
          "text-label-m tabular-nums",
          seconds === null ? "text-muted" : seconds <= 60 && "text-danger",
        )}
      >
        {text}
      </p>
    </div>
  );
}

export function BookingModal({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const options = useFilterOptions();
  const sessionQ = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
  });
  // the map is always fetched fresh when the modal opens
  const mapQ = useQuery({
    queryKey: ["seats", sessionId],
    queryFn: () => getSeatMap(sessionId),
    gcTime: 0,
    staleTime: 0,
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<SelectedSeat[]>([]);
  const [hold, setHold] = useState<SeatHold | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [lost, setLost] = useState<string[]>([]);

  const resetToSeats = (message: string) => {
    setHold(null);
    setSelected([]);
    setLost([]);
    setStep(1);
    setNotice(message);
    void mapQ.refetch();
  };

  const secondsLeft = useCountdown(hold?.expiresAt ?? null, () => resetToSeats(EXPIRED));

  // 409: keep what survived, mark the contested seats as sold and refetch the map
  const handleConflict = (codes: string[]) => {
    setLost((prev) => [...new Set([...prev, ...codes])]);
    setSelected((prev) => prev.filter((s) => !codes.includes(s.code)));
    setHold(null);
    setStep(1);
    setNotice(`Seats ${codes.join(", ")} were just taken. Please choose other seats.`);
    void mapQ.refetch();
  };

  const holdMutation = useMutation({
    mutationFn: () =>
      createHold(
        sessionId,
        selected.map((s) => ({ seatId: s.seatId, ticketType: s.ticketType })),
      ),
    onSuccess: (h) => {
      setHold(h);
      setNotice("");
      setStep(2);
    },
    onError: (e) => {
      if (e instanceof Error && e.message === "AuthCancelled") return;
      const err = parseApiError(e);
      if (err.status === 409) return handleConflict(err.contested ?? []);
      setNotice(err.fieldErrors ? Object.values(err.fieldErrors).flat()[0] : err.message);
    },
  });

  const handleClose = () => {
    if (hold && !order) releaseHold(hold.holdId).catch(() => undefined);
    onClose();
  };

  const onPaid = (o: Order) => {
    setOrder(o);
    setHold(null);
    void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["sessions"] });
    void queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
  };

  const session = sessionQ.data;
  const map = mapQ.data;
  const opts = options.data;

  if (!session || !map || !opts) {
    const failed = sessionQ.isError || mapQ.isError || options.isError;
    return (
      <Modal onClose={handleClose} className={SIZE}>
        {failed ? (
          <ErrorState
            onRetry={() => {
              void sessionQ.refetch();
              void mapQ.refetch();
              void options.refetch();
            }}
          />
        ) : (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-[380px] w-full" />
          </div>
        )}
      </Modal>
    );
  }

  if (order) {
    return (
      <Modal onClose={handleClose} className={SIZE}>
        <Confirmation
          order={order}
          onViewTickets={() => {
            onClose();
            navigate("/profile?tab=tickets");
          }}
          onHome={() => {
            onClose();
            navigate("/");
          }}
        />
      </Modal>
    );
  }

  const { ageRating } = session.movie;
  const max = opts.maxSeatsPerOrder;
  const ageBlocked = !!user && user.age !== null && user.age < ageRating.minAge;
  const violations = seatViolations(selected, opts.ticketTypes, ageRating.minAge, max);
  const messages = [
    ...(ageBlocked
      ? [`This film is rated ${ageRating.code}. You cannot buy tickets for it with this account.`]
      : []),
    ...violations,
    ...(notice ? [notice] : []),
  ];

  const statusOf = (seat: Seat): SeatStatus => {
    if (lost.includes(seat.code)) return "sold";
    if (selected.some((s) => s.seatId === seat.id)) return "selected";
    if (seat.state === "held" && seat.isMine) return "available"; // my own hold stays selectable
    return seat.state;
  };

  const toggleSeat = (seat: Seat) => {
    setNotice("");
    if (selected.some((s) => s.seatId === seat.id)) {
      setSelected(selected.filter((s) => s.seatId !== seat.id));
    } else if (selected.length >= max) {
      setNotice(`You can select up to ${max} seats per order.`);
    } else {
      setSelected([...selected, { seatId: seat.id, code: seat.code, ticketType: "adult" }]);
    }
  };

  const onNext = () => {
    if (!user?.profileComplete) {
      onClose();
      navigate("/profile"); // the profile page shows "Please complete your profile to enable booking."
      return;
    }
    holdMutation.mutate();
  };

  const tabs = <StepTabs step={step} onSeats={() => setStep(1)} />;
  const details = [
    session.venue.name,
    `Hall ${session.hall.name}`,
    format(parseISO(session.date), "EEEE d MMMM"),
    session.time,
    session.format.name,
    session.language.name,
  ].join(" · ");

  return (
    <Modal onClose={handleClose} className={SIZE}>
      <header className="flex items-start justify-between gap-4 pr-10">
        <div className="min-w-0">
          <h2 className="text-h2 truncate uppercase">{session.movie.title}</h2>
          <p className="text-body-s mt-1 text-muted">{details}</p>
        </div>
        <HoldBadge seconds={secondsLeft} fallback={`${opts.holdMinutes}:00`} />
      </header>

      <div className="mt-5 grid min-h-[430px] grid-cols-[minmax(0,1fr)_380px]">
        {step === 1 ? (
          <>
            <div className="flex min-w-0 flex-col gap-4 pr-6">
              {tabs}
              <SeatGrid map={map} statusOf={statusOf} onToggle={toggleSeat} />
            </div>
            <SeatsPanel
              selected={selected}
              types={opts.ticketTypes}
              basePrice={session.price}
              maxSeats={max}
              minAge={ageRating.minAge}
              messages={messages}
              subtotal={subtotalOf(selected, opts.ticketTypes, session.price)}
              nextDisabled={selected.length === 0 || violations.length > 0 || ageBlocked}
              nextLoading={holdMutation.isPending}
              onType={(seatId, slug) =>
                setSelected(
                  selected.map((s) => (s.seatId === seatId ? { ...s, ticketType: slug } : s)),
                )
              }
              onRemove={(seatId) => setSelected(selected.filter((s) => s.seatId !== seatId))}
              onNext={onNext}
            />
          </>
        ) : (
          hold &&
          user && (
            <CheckoutStep
              tabs={tabs}
              hold={hold}
              session={session}
              user={user}
              onPaid={onPaid}
              onConflict={handleConflict}
              onExpired={resetToSeats}
            />
          )
        )}
      </div>
    </Modal>
  );
}
