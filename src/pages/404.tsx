import Link from 'next/link';
import { ArrowLeft, Compass, Sparkles } from 'lucide-react';

const NotFoundPage = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('404 Error: User attempted to access non-existent route');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15)_0%,_rgba(15,118,110,0.18)_40%,_rgba(15,23,42,1)_85%)]" />
        <div className="absolute -left-24 top-24 h-[22rem] w-[22rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-[-8rem] h-[26rem] w-[26rem] rounded-full bg-sky-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
          <Compass className="h-4 w-4" /> Route anomaly detected
        </div>

        <div className="mt-10 space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Signal lost in the pasture
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-300/90 sm:text-lg">
            The path you requested doesn’t map to any Herd Rhythm command surface. Check the URL or return to a verified launch point below.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left text-slate-200 backdrop-blur transition hover:border-emerald-300/40 hover:bg-emerald-500/10"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">
                Primary console
              </p>
              <h2 className="text-lg font-semibold text-white">Return to dashboard</h2>
              <p className="text-sm text-slate-300/80">
                Navigate back to your personalized command surface and resume orchestration.
              </p>
            </div>
            <ArrowLeft className="h-6 w-6 text-emerald-200 transition group-hover:-translate-x-1" />
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left text-slate-200 backdrop-blur transition hover:border-sky-300/40 hover:bg-sky-500/10"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200">
                Authentication
              </p>
              <h2 className="text-lg font-semibold text-white">Access portal</h2>
              <p className="text-sm text-slate-300/80">
                Need to authenticate again? Re-enter through the secure login gateway.
              </p>
            </div>
            <Sparkles className="h-6 w-6 text-sky-200" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
