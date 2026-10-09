import { Link } from "react-router-dom";

export function SectionHeader({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex h-[26px] items-center justify-between">
      <h2 className="text-base font-extrabold uppercase tracking-wide">{title}</h2>
      {to && (
        <Link to={to} className="text-label-s text-primary hover:underline">
          See all
        </Link>
      )}
    </div>
  );
}
