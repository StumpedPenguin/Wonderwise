import { redirect } from "next/navigation";
import { getUser } from "@/lib/family";
import { getFamilyByOwner } from "@/lib/db";
import { createMyFamily } from "@/lib/onboarding-actions";

export const dynamic = "force-dynamic";

export default async function Welcome() {
  const user = await getUser();
  if (!user) redirect("/login");
  const existing = await getFamilyByOwner(user.id);
  if (existing) redirect("/");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center px-5 py-16">
      <div className="w-full rounded-4xl bg-white px-8 py-10 text-center shadow-lg">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-2 font-display text-3xl font-bold text-sky-600">
          Welcome to Wonderwise!
        </h1>
        <p className="mt-2 text-slate-500">Let's set up your family.</p>

        <form action={createMyFamily} className="mt-6 flex flex-col gap-3">
          <input
            id="familyName"
            name="familyName"
            required
            defaultValue="My Family"
            maxLength={60}
            placeholder="Your family name"
            className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg text-slate-700 outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md"
          >
            Create my family →
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-400">
          Next you'll add your kids in the grown-up zone.
        </p>
      </div>
    </main>
  );
}
