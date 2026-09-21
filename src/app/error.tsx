"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console and Vercel runtime logs.
    console.error("Wonderwise page error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-5 py-16 text-center">
      <div className="rounded-4xl bg-white px-8 py-10 shadow-lg">
        <div className="text-6xl">🛠️</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-700">
          Oops — something hiccuped
        </h1>
        <p className="mt-2 text-slate-500">
          We couldn't load this page. Let's try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-bounce mt-6 rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md"
        >
          🔄 Try again
        </button>
      </div>
    </main>
  );
}
