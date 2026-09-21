"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { finishSession, type FinishResult } from "@/lib/actions";
import type { Question } from "@/lib/types";
import { accentFor } from "@/lib/theme";
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
    /* speech is a nice-to-have */
  }
}

export function PlayGame({
  childId,
  childName,
  color,
  sessionId,
  questions,
}: {
  childId: string;
  childName: string;
  color: string;
  sessionId: string;
  questions: Question[];
}) {
  const accent = accentFor(color);
  const [phase, setPhase] = useState<Phase>("playing");
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<FinishResult | null>(null);
  const responses = useRef<Record<string, string>>({});

  const current = questions[index];

  useEffect(() => {
    if (phase === "done" && result) {
      speak(
        result.tokens > 0
          ? `Awesome ${childName}! You earned ${result.tokens} tokens!`
          : `Great effort, ${childName}!`,
      );
    }
  }, [phase, result, childName]);

  const finish = useCallback(async () => {
    setPhase("finishing");
    setResult(await finishSession(sessionId, responses.current));
    setPhase("done");
  }, [sessionId]);

  const onComplete = useCallback(
    (value: string) => {
      responses.current[current.id] = value;
      if (index + 1 >= questions.length) {
        void finish();
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, index, questions.length, finish],
  );

  if (phase === "done" && result) {
    return <RewardScreen childId={childId} color={color} result={result} />;
  }
  if (phase === "finishing") {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="animate-pop text-6xl">✨</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center gap-2">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-3 w-3 rounded-full ${
              i < index ? "bg-emerald-400" : i === index ? accent.solid : "bg-white/70"
            }`}
          />
        ))}
      </div>

      {current.kind === "spell" ? (
        <SpellQuestion key={current.id} question={current} accent={accent} onComplete={onComplete} />
      ) : (
        <ChoiceQuestion key={current.id} question={current} accent={accent} onComplete={onComplete} />
      )}

      <div className="mt-6 text-center">
        <Link href={`/play/${childId}`} className="text-slate-400 underline-offset-4 hover:underline">
          Stop for now
        </Link>
      </div>
    </div>
  );
}

// --- Multiple-choice question ----------------------------------------------

function ChoiceQuestion({
  question,
  accent,
  onComplete,
}: {
  question: Question;
  accent: ReturnType<typeof accentFor>;
  onComplete: (value: string) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    speak(question.spoken);
  }, [question.spoken]);

  const answeredWrong = chosen !== null && chosen !== question.answer;
  const answeredRight = chosen !== null && chosen === question.answer;
  const longPrompt = question.promptText.length > 6;

  function choose(value: string) {
    if (locked.current) return;
    locked.current = true;
    setChosen(value);
    window.setTimeout(() => onComplete(value), 1100);
  }

  return (
    <>
      <section className="mt-6 flex flex-col items-center rounded-4xl bg-white px-6 py-10 shadow-lg">
        <button
          type="button"
          onClick={() => speak(question.spoken)}
          className={`btn-bounce mb-4 inline-flex items-center gap-2 rounded-full ${accent.soft} px-4 py-2 font-display ${accent.text}`}
          aria-label="Hear it again"
        >
          🔊 Say it again
        </button>
        <div
          className={`text-center font-display font-bold tabular-nums ${
            longPrompt ? "text-4xl leading-snug" : "text-7xl sm:text-8xl"
          } ${answeredWrong ? "animate-shake text-rose-500" : "text-slate-800"} break-words`}
        >
          {question.promptText}
        </div>
        {answeredWrong && (
          <p className="mt-4 font-display text-2xl text-slate-500">
            The answer is <span className="text-emerald-600">{question.answer}</span>
          </p>
        )}
        {answeredRight && (
          <p className="mt-4 animate-pop font-display text-2xl text-emerald-600">Yes! 🎉</p>
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        {question.choices.map((choice) => {
          const isChosen = chosen === choice;
          const isAnswer = choice === question.answer;
          let tone = `bg-white ${accent.text} ring-2 ${accent.ring} hover:brightness-105`;
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
              className={`btn-bounce rounded-4xl py-8 font-display text-5xl font-bold shadow-md ${tone}`}
            >
              {choice}
            </button>
          );
        })}
      </section>
    </>
  );
}

// --- Spelling question ------------------------------------------------------

function SpellQuestion({
  question,
  accent,
  onComplete,
}: {
  question: Question;
  accent: ReturnType<typeof accentFor>;
  onComplete: (value: string) => void;
}) {
  const [used, setUsed] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const locked = useRef(false);
  const target = question.answer;

  useEffect(() => {
    speak(question.spoken);
  }, [question.spoken]);

  const assembled = used.map((i) => question.choices[i]).join("");
  const isCorrect = assembled === target;

  useEffect(() => {
    if (used.length === target.length && !locked.current) {
      locked.current = true;
      setChecked(true);
      const value = used.map((i) => question.choices[i]).join("");
      window.setTimeout(() => onComplete(value), 1300);
    }
  }, [used, target.length, question.choices, onComplete]);

  function tapTile(i: number) {
    if (locked.current || used.includes(i)) return;
    setUsed((u) => [...u, i]);
  }
  function backspace() {
    if (locked.current) return;
    setUsed((u) => u.slice(0, -1));
  }

  return (
    <>
      <section className="mt-6 flex flex-col items-center rounded-4xl bg-white px-6 py-8 shadow-lg">
        <button
          type="button"
          onClick={() => speak(question.spoken)}
          className={`btn-bounce mb-3 inline-flex items-center gap-2 rounded-full ${accent.soft} px-4 py-2 font-display ${accent.text}`}
        >
          🔊 Say it again
        </button>
        <div className="text-7xl">{question.promptText}</div>

        {/* Slots */}
        <div className="mt-5 flex gap-2">
          {Array.from({ length: target.length }).map((_, slot) => {
            const letter = used[slot] !== undefined ? question.choices[used[slot]] : "";
            const tone = checked
              ? isCorrect
                ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                : "border-rose-300 bg-rose-50 text-rose-500"
              : "border-slate-200 text-slate-700";
            return (
              <span
                key={slot}
                className={`grid h-14 w-14 place-items-center rounded-2xl border-2 font-display text-3xl font-bold uppercase ${tone}`}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {checked && !isCorrect && (
          <p className="mt-3 font-display text-lg text-slate-500">
            It's spelled <span className="uppercase text-emerald-600">{target}</span>
          </p>
        )}
        {checked && isCorrect && (
          <p className="mt-3 animate-pop font-display text-lg text-emerald-600">Perfect! 🎉</p>
        )}
      </section>

      {/* Letter bank */}
      <section className="mt-6 flex flex-wrap justify-center gap-3">
        {question.choices.map((letter, i) => (
          <button
            key={i}
            type="button"
            disabled={used.includes(i) || locked.current}
            onClick={() => tapTile(i)}
            className={`btn-bounce grid h-16 w-16 place-items-center rounded-2xl font-display text-3xl font-bold uppercase shadow-md ${
              used.includes(i)
                ? "bg-slate-100 text-slate-300"
                : `bg-white ${accent.text} ring-2 ${accent.ring}`
            }`}
          >
            {letter}
          </button>
        ))}
      </section>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={backspace}
          disabled={used.length === 0 || locked.current}
          className="btn-bounce rounded-full bg-white px-5 py-2 font-display text-slate-500 shadow-sm ring-2 ring-slate-100 disabled:opacity-40"
        >
          ⌫ Undo
        </button>
      </div>
    </>
  );
}

// --- Reward screen ----------------------------------------------------------

function RewardScreen({
  childId,
  color,
  result,
}: {
  childId: string;
  color: string;
  result: FinishResult;
}) {
  const accent = accentFor(color);
  return (
    <div className="relative grid flex-1 place-items-center overflow-hidden text-center">
      {result.tokens > 0 &&
        Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute bottom-24 animate-floatUp text-3xl"
            style={{ left: `${8 + i * 9}%`, animationDelay: `${i * 0.08}s` }}
            aria-hidden
          >
            🪙
          </span>
        ))}

      <div className="animate-pop rounded-4xl bg-white px-8 py-10 shadow-xl">
        <div className="text-7xl">{result.tokens > 0 ? "🌟" : "💪"}</div>
        <h2 className={`mt-3 font-display text-4xl font-bold ${accent.text}`}>
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
            ⬆️ Level up! Harder next time.
          </p>
        )}
        {result.hitDailyCap && (
          <p className="mt-3 text-sm text-slate-400">
            You've earned lots today — come back tomorrow for more! 🌙
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/play/${childId}`}
            className={`btn-bounce rounded-full ${accent.solid} px-6 py-3 font-display text-lg font-bold text-white shadow-md`}
          >
            🎮 More games
          </Link>
          <Link
            href={`/play/${childId}/prizes`}
            className="btn-bounce rounded-full bg-white px-6 py-3 font-display text-lg font-bold text-slate-600 shadow-md ring-2 ring-slate-100"
          >
            🎁 Prize shop
          </Link>
        </div>
      </div>
    </div>
  );
}
