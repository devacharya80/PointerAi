import { LoaderCircle } from "lucide-react";

interface InlineSpinnerProps {
  label?: string;
}

export default function InlineSpinner({ label }: InlineSpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-xs text-gray-400"
    >
      <LoaderCircle size={14} className="animate-spin" />
      {label && <span>{label}</span>}
    </span>
  );
}