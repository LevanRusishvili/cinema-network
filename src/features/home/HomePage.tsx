import { useState } from "react";
import { Hero } from "./Hero";
import { RecentlyViewed } from "./RecentlyViewed";
import { NowPlaying } from "./NowPlaying";
import { ComingSoon } from "./ComingSoon";
import { readRecentlyViewed } from "@/lib/recentlyViewed";

export default function HomePage() {
  const [recent] = useState(readRecentlyViewed);

  return (
    <>
      <Hero />
      <div className="mx-auto flex max-w-app flex-col gap-10 py-10">
        {recent.length > 0 && <RecentlyViewed items={recent} />}
        <NowPlaying />
        <div className="h-px bg-surface-2" />
        <ComingSoon />
      </div>
    </>
  );
}
