interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* Background blur + dim */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Loading card */}
      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          gap-5
          rounded-2xl
          border
          border-gray-600/50
          bg-[#2f2f2f]
          px-10
          py-8
          shadow-2xl
        "
      >
        {/* Spinner */}
        <div className="relative h-11 w-11">

          {/* Static ring */}
          <div
            className="
              absolute
              inset-0
              rounded-full
              border-4
              border-[#1f1f1f]
            "
          />

          {/* Animated ring */}
          <div
            className="
              absolute
              inset-0
              rounded-full
              border-4
              border-transparent
              border-t-white
              animate-spin
            "
          />

        </div>

        <p className="text-sm font-medium tracking-wide text-white">
          {message}
        </p>
      </div>
    </div>
  );
}