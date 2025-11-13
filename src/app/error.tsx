"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  console.error("App router error:", error);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-slate-300">
          An unexpected error occurred. Please try again or return to your
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:border-white/40"
            onClick={() => reset()}
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
          >
            Return home
          </a>
        </div>
      </div>
    </main>
  );
};

export default GlobalError;
