import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ModalRoot } from "@/app/ModalRoot";
import { cn } from "@/lib/cn";

export function Layout() {
  const isHome = useLocation().pathname === "/";
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className={cn("flex-1", !isHome && "pt-[111px]")}>
        <Outlet />
      </main>
      <Footer />
      <ModalRoot />
    </div>
  );
}
