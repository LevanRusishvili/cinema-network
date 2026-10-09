import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/api/endpoints/tickets";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { PersonalInfo } from "./PersonalInfo";
import { MyTickets } from "./MyTickets";

type Tab = "info" | "tickets";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const openModal = useModalStore((s) => s.open);
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "tickets" ? "tickets" : "info";

  useEffect(() => {
    if (ready && !user) openModal({ type: "login" });
  }, [ready, user, openModal]);

  // shares the cache with MyTickets, so the badge needs no extra request
  const tickets = useQuery({ queryKey: ["tickets"], queryFn: () => getTickets(), enabled: !!user });
  const upcomingCount = (tickets.data ?? []).filter(
    (o) => o.isUpcoming && o.status === "paid",
  ).length;

  if (!ready)
    return (
      <div className="mx-auto max-w-app px-[70px]" aria-busy="true">
        <Skeleton className="h-8 w-48" />
      </div>
    );

  if (!user)
    return (
      <EmptyState
        title="Please log in"
        description="Your profile and tickets are available after you sign in."
        action={{ label: "Log in", onClick: () => openModal({ type: "login" }) }}
      />
    );

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6 px-[70px] pb-16">
      <h1 className="text-h1">My Profile</h1>
      <Tabs<Tab>
        tabs={[
          { id: "info", label: "Personal Information" },
          { id: "tickets", label: "My Tickets", count: upcomingCount },
        ]}
        value={tab}
        onChange={(id) => setParams(id === "tickets" ? { tab: "tickets" } : {})}
      />
      {tab === "info" ? <PersonalInfo user={user} /> : <MyTickets />}
    </div>
  );
}
