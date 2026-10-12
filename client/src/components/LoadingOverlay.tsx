interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#242424] px-8 py-7 shadow-2xl">
        <div className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />

        <p className="text-sm font-medium text-white">
          {message}
        </p>
      </div>
    </div>
  );
}