import type { ReactNode } from "react";
import { CheckIcon } from "./icons";

type Props = {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: ReactNode;
};

export function Checkbox({ checked, onChange, label, hint }: Props) {
  return (
    <label className="flex h-4 cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/30 bg-bg text-transparent transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-white/50">
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="text-[12px] font-medium">{label}</span>
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </label>
  );
}
