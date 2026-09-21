"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { finishSession, type FinishResult } from "@/lib/actions";
import type { Question } from "@/lib/types";
import { TokenBadge } from "./TokenBadge";

type Phase = "playing" | "finishing" | "done";

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.15;
    synth.speak(u);
  } catch {
    /* speech is a nice-to-have; ignore if unavailable */
  }
}

export function MathGame({
  childId,
  childName,
  sessionId,
  questions,
}: {
  childId: string;
  childName: string;
  sessionId: string;
  questions: Question[];
}) {
  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);
  const responses = useRef<Record<string, number>>({});
  const advancing = useRef(false);

  const current = questions[index];

  // Read each new question aloud.
  useEffect(() => {
    if (phase === "playing" && current) speak(current.spoken);
  }, [index, phase, current]);

  // Celebrate out loud when we land on the reward screen.
  useEffect(() => {
    if (phase === "done" && result) {
      const msg =
        result.tokens > 0
          ? `Awesome ${childName}! You earned ${result.tokens} tokens!`
          : `Great effort, ${childName}!`;
      speak(msg);
    }
  }, [phase, result, childName]);

  const finish = useCallback(async () => {
    setPhase("finishing");
    const res = await finishSession(sessionId, responses.current);
    setResult(res);
    setPhase("done");
  }, [sessionId]);

  function choose(value: number) {
    if (chosen !== null || advancing.current) return;
    advancing.current = true;
    setChosen(value);
    responses.current[current.id] = value;

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        void finish();
      } else {
        setIndex((i) => i + 1);
        setChosen(null);
        advancing.current = false;
      }
    }, 1100);
  }

  if (phase === "done" && result) {
    return <RewardScreen childId={childId} result={result} />;
  }

  if (phase === "finishing") {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="animate-pop text-6xl">✨</div>
      </div>
    );
  }

  const answeredCorrectly = chosen !== null && chosen === current.answer;
  const answeredWrong = chosen !== null && chosen !== current.answer;

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-3 w-3 rounded-full ${
              i < index ? "bg-emerald-400" : i === index ? "bg-sky-500" : "bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <section className="mt-6 flex flex-col items-center rounded-4xl bg-white px-6 py-10 shadow-lg">
        <button
          type="button"
          onClick={() => speak(current.spoken)}
          className="btn-bounce mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 font-display text-sky-600"
          aria-label="Hear the question again"
        >
          🔊 Say it again
        </button>
        <div
          className={`font-display text-7xl font-bold tabular-nums sm:text-8xl ${
            answeredWrong ? "animate-shake text-rose-500" : "text-slate-800"
          }`}
        >
          {current.prompt}
        </div>
        {answeredWrong && (
          <p className="mt-4 font-display text-2xl text-slate-500">
            The answer is <span className="text-emerald-600">{current.answer}</span>
          </p>
        )}
        {answeredCorrectly && (
          <p className="mt-4 animate-pop font-display text-2xl text-emerald-600">
            Yes! 🎉
          </p>
        )}
      </section>

      {/* Choices */}
      <section className="mt-6 grid grid-cols-2 gap-4">
        {current.choices.map((choice) => {
          const isChosen = chosen === choice;
          const isAnswer = choice === current.answer;
          let tone = "bg-white text-sky-600 ring-2 ring-sky-100 hover:ring-sky-300";
          if (chosen !== null) {
            if (isAnswer) tone = "bg-emerald-400 text-white ring-2 ring-emerald-400";
            else if (isChosen) tone = "bg-rose-300 text-white ring-2 ring-rose-300";
            else tone = "bg-white text-slate-300 ring-2 ring-slate-100";
          }
          return (
            <button
              key={choice}
              type="button"
              disabled={chosen !== null}
              onClick={() => choose(choice)}
              className={`btn-bounce rounded-4xl py-8 font-display text-5xl font-bold tabular-nums shadow-md ${tone}`}
            >
              {choice}
            </button>
          );
        })}
      </section>

      <div className="mt-6 text-center">
        <Link href={`/play/${childId}`} className="text-slate-400 underline-offset-4 hover:underline">
          Stop for now
        </Link>
      </div>
    </div>
  );
}

function RewardScreen({
  childId,
  result,
}: {
  childId: string;
  result: FinishResult;
}) {
  return (
    <div className="relative grid flex-1 place-items-center overflow-hidden text-center">
      {/* Coin burst */}
      {result.tokens > 0 &&
        Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute bottom-24 animate-floatUp text-3xl"
            style={{
              left: `${8 + i * 9}%`,
              animationDelay: `${i * 0.08}s`,
            }}
            aria-hidden
          >
            🪙
          </span>
        ))}

      <div className="animate-pop rounded-4xl bg-white px-8 py-10 shadow-xl">
        <div className="text-7xl">{result.tokens > 0 ? "🌟" : "💪"}</div>
        <h2 className="mt-3 font-display text-4xl font-bold text-sky-600">
          {result.tokens > 0 ? "You did it!" : "Nice try!"}
        </h2>
        <p className="mt-2 font-display text-2xl text-slate-600">
          {result.correct} / {result.total} correct
        </p>

        <div className="mt-5">
          <p className="text-slate-500">You earned</p>
          <div className="mt-1">
            <TokenBadge amount={result.tokens} size="lg" />
          </div>
        </div>

        {result.leveledUp && (
          <p className="mt-4 font-display text-lg text-violet-500">
            ⬆️ Level up! Bigger numbers next time.
          </p>
        )}
        {result.hitDailyCap && (
          <p className="mt-3 text-sm text-slate-400">
            You've earned lots today — come back tomorrow for more! 🌙
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {/* Full navigation forces a fresh server session. */}
          <a
            href={`/play/${childId}/math`}
            className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md"
          >
            🔁 Play again
          </a>
          <Link
            href={`/play/${childId}`}
            className="btn-bounce rounded-full bg-white px-6 py-3 font-display text-lg font-bold text-slate-600 shadow-md ring-2 ring-slate-100"
          >
            🏠 All done
          </Link>
        </div>
      </div>
    </div>
  );
}
