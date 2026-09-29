export default function LoadingScreen() {
  return (
    <main
      dir="rtl"
      role="status"
      aria-live="polite"
      aria-label="جارٍ تجهيز المنصة"
      className="grid min-h-dvh place-items-center overflow-hidden bg-[#050f1f] px-6 text-center text-white"
    >
      <div className="flex flex-col items-center">
        <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
          <div
            aria-hidden="true"
            className="absolute inset-2 animate-spin rounded-full border-[3px] border-white/10 border-t-[#1685f8] border-l-[#40e2b2] motion-reduce:animate-none"
            style={{ animationDuration: '1.4s' }}
          />
          <div aria-hidden="true" className="absolute inset-5 rounded-full border border-white/5" />
          <img
            src="/assets/brand/attia-logo-transparent.png"
            alt="منصة مستر عطية كامل"
            className="relative z-10 max-h-28 w-40 object-contain drop-shadow-[0_0_24px_rgba(22,133,248,0.2)] sm:w-48"
          />
        </div>
        <p className="mt-5 text-sm font-medium tracking-wide text-slate-300 sm:text-base">
          جارٍ تجهيز المنصة...
        </p>
        <div aria-hidden="true" className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1685f8] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#40e2b2] [animation-delay:180ms] motion-reduce:animate-none" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1685f8] [animation-delay:360ms] motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  );
}
