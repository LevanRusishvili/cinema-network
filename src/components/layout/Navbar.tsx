import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { User } from "@/types";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

function Avatar({ user, className }: { user: User; className?: string }) {
  const name = user.fullName || user.username;
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 rounded-lg bg-surface text-label-s",
        className,
      )}
    >
      {user.avatar ? (
        <img src={user.avatar} alt="" className="h-full w-full rounded-[inherit] object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials(name)}</span>
      )}
      <span
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg",
          user.profileComplete ? "bg-success" : "bg-warning",
        )}
      />
    </span>
  );
}

function UserMenu({ user }: { user: User }) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const name = user.fullName || user.username;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2"
      >
        <Avatar user={user} />
        <span className="text-label-m">{name.split(" ")[0]}</span>
        <span aria-hidden className={cn("text-xs transition", open && "rotate-180")}>
          ⌄
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-3 w-[302px] rounded-2xl border border-surface-2 bg-bg p-3 shadow-modal"
        >
          <div className="flex items-center gap-3 p-1">
            <Avatar user={user} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="text-label-m truncate">{name}</p>
              <p className="text-body-s truncate text-muted">{user.email}</p>
            </div>
          </div>

          {user.profileComplete ? (
            <div className="text-label-m mt-3 rounded-lg bg-success/10 px-3 py-2 text-success">
              Profile Complete ✓
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2">
              <p className="text-label-m text-warning">Profile incomplete</p>
              <p className="text-body-s text-muted">
                Please complete your profile to enable booking
              </p>
            </div>
          )}

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-label-m mt-2 block rounded-lg px-3 py-2.5 hover:bg-surface"
          >
            My Profile
          </Link>
          <Link
            to="/profile?tab=tickets"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-label-m block rounded-lg px-3 py-2.5 hover:bg-surface"
          >
            My Tickets
          </Link>
          <div className="my-2 border-t border-surface" />
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate("/");
            }}
            className="text-label-m block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-primary hover:bg-surface"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const open = useModalStore((s) => s.open);

  return (
    <header className="absolute inset-x-0 top-0 z-30 bg-[linear-gradient(180deg,#000_-212.35%,rgba(0,0,0,0.51)_32.09%,rgba(0,0,0,0)_93.93%)]">
      <nav className="mx-auto flex h-[111px] max-w-app items-center gap-8 px-[60px] pb-[40px] pt-[30px]">
        <Link to="/" className="text-h3 tracking-wide">
          KINO <span className="text-primary">XII</span>
        </Link>
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            cn("text-overline hover:text-white", isActive ? "text-white" : "text-white/80")
          }
        >
          Sessions
        </NavLink>

        <div className="ml-auto flex items-center gap-6">
          <div className="text-body-s flex h-9 w-[320px] items-center gap-2 rounded-full bg-white/10 px-4 text-muted">
            <span aria-hidden>⌕</span> Search films and live events
          </div>
          {ready &&
            (user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => open({ type: "register" })}>
                  Sign up
                </Button>
                <Button size="sm" variant="light" onClick={() => open({ type: "login" })}>
                  Log in
                </Button>
              </div>
            ))}
        </div>
      </nav>
    </header>
  );
}
