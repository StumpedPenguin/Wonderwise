"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { finishSession, startGame, type FinishResult } from "@/lib/actions";
import type { Difficulty, Question } from "@/lib/types";
import { accentFor } from "@/lib/theme";
import { speak } from "@/lib/speak";
import { TokenBadge } from "./TokenBadge";

type Phase = "choosing" | "loading" | "playing" | "finishing" | "done" | "error";

const LEVELS: { id: Difficulty; label: string; per: number; tone: string }[] = [
  { id: "easy", label: "Easy", per: 1, tone: "from-emerald-400 to-teal-500" },
  { id: "medium", label: "Medium", per: 3, tone: "from-amber-400 to-orange-500" },
  { id: "hard", label: "Hard", per: 5, tone: "from-rose-400 to-pink-500" },
];

export function PlayGame({
  childId,
  childName,
  color,
  gameId,
}: {
  childId: string;
  childName: string;
  color: string;
  gameId: string;
}) {
  const accent = accentFor(color);
  const [phase, setPhase] = useState<Phase>("choosing");
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<FinishResult | null>(null);
  const responses = useRef<Record<string, string>>({});

  const current = questions[index];

  // Start the round only after a difficulty is picked, and from the client —
  // so the server render stays pure and a later revalidation never clears the
  // reward screen.
  const pick = useCallback(
    (difficulty: Difficulty) => {
      setPhase("loading");
      (async () => {
        const res = await startGame(childId, gameId, difficulty);
        if (!res.ok) {
          setPhase("error");
          return;
        }
        responses.current = {};
        setSessionId(res.sessionId);
        setQuestions(res.questions);
        setIndex(0);
        setPhase("playing");
      })();
    },
    [childId, gameId],
  );

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
      if (!current) return;
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
    return (
      <RewardScreen childId={childId} gameId={gameId} color={color} result={result} />
    );
  }
  if (phase === "finishing") {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="animate-pop text-6xl">✨</div>
      </div>
    );
  }
  if (phase === "choosing") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8">
        <p className="font-display text-3xl font-bold text-slate-600">Pick a level!</p>
        <div className="grid w-full max-w-sm gap-4">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => pick(lvl.id)}
              className={`btn-bounce flex items-center justify-between rounded-4xl bg-gradient-to-br ${lvl.tone} px-6 py-5 text-white shadow-lg`}
            >
              <span className="font-display text-2xl font-bold">{lvl.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 font-display font-bold">
                {lvl.per} 🪙 each
              </span>
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-400">Get 80% right to earn your tokens!</p>
      </div>
    );
  }
  if (phase === "loading" || !current) {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="animate-wiggle text-6xl">🎲</div>
      </div>
    );
  }
  if (phase === "error") {
    return (
      <div className="grid flex-1 place-items-center px-6 text-center">
        <div className="rounded-4xl bg-white px-8 py-10 shadow-lg">
          <div className="text-5xl">😕</div>
          <p className="mt-3 font-display text-xl text-slate-600">
            Couldn't start the game.
          </p>
          <Link
            href={`/play/${childId}`}
            className={`btn-bounce mt-5 inline-block rounded-full ${accent.solid} px-6 py-3 font-display font-bold text-white shadow-md`}
          >
            Back to games
          </Link>
        </div>
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
      ) : current.kind === "trace" ? (
        <TraceQuestion key={current.id} question={current} accent={accent} onComplete={onComplete} />
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
          const size = choice.length <= 2 ? "text-5xl" : "text-3xl";
          return (
            <button
              key={choice}
              type="button"
              disabled={chosen !== null}
              onClick={() => choose(choice)}
              className={`btn-bounce break-words rounded-4xl px-2 py-8 font-display font-bold shadow-md ${size} ${tone}`}
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

// --- Tracing question -------------------------------------------------------

const TRACE_SIZE = 300;
const TRACE_STROKE = "#10b981";

function TraceQuestion({
  question,
  accent,
  onComplete,
}: {
  question: Question;
  accent: ReturnType<typeof accentFor>;
  onComplete: (value: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawn = useRef<{ x: number; y: number }[]>([]);
  const samples = useRef<{ x: number; y: number }[]>([]);
  const onCells = useRef<Set<string>>(new Set());
  const drawing = useRef(false);
  const locked = useRef(false);
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => {
    speak(question.spoken);
  }, [question.spoken]);

  function drawGuide(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, TRACE_SIZE, TRACE_SIZE);
    ctx.save();
    ctx.fillStyle = "rgba(100,116,139,0.18)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 220px system-ui, sans-serif";
    ctx.fillText(question.promptText, TRACE_SIZE / 2, TRACE_SIZE / 2 + 8);
    ctx.restore();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    drawGuide(ctx);

    const off = document.createElement("canvas");
    off.width = TRACE_SIZE;
    off.height = TRACE_SIZE;
    const octx = off.getContext("2d");
    if (octx) {
      octx.fillStyle = "#000";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = "bold 220px system-ui, sans-serif";
      octx.fillText(question.promptText, TRACE_SIZE / 2, TRACE_SIZE / 2 + 8);
      const data = octx.getImageData(0, 0, TRACE_SIZE, TRACE_SIZE).data;
      const filled: { x: number; y: number }[] = [];
      for (let y = 0; y < TRACE_SIZE; y += 6) {
        for (let x = 0; x < TRACE_SIZE; x += 6) {
          if (data[(y * TRACE_SIZE + x) * 4 + 3] > 128) filled.push({ x, y });
        }
      }
      // Grid of cells the glyph fills — used to reject drawing off the shape.
      const cells = new Set<string>();
      for (const p of filled) cells.add(`${p.x / 6}|${p.y / 6}`);
      onCells.current = cells;

      for (let i = filled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filled[i], filled[j]] = [filled[j], filled[i]];
      }
      samples.current = filled.slice(0, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.promptText]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  }

  function paint(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = TRACE_STROKE;
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (locked.current) return;
    drawing.current = true;
    const p = pos(e);
    drawn.current.push(p);
    paint(p, p);
  }
  function moveHandler(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || locked.current) return;
    const p = pos(e);
    const prev = drawn.current[drawn.current.length - 1] ?? p;
    drawn.current.push(p);
    paint(prev, p);
  }
  function up() {
    drawing.current = false;
  }

  function clear() {
    if (locked.current) return;
    drawn.current = [];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawGuide(ctx);
  }

  function done() {
    if (locked.current) return;
    locked.current = true;
    const pts = drawn.current;

    // Recall: how much of the glyph the child covered.
    const R2 = 24 * 24;
    let hits = 0;
    for (const s of samples.current) {
      if (pts.some((d) => (d.x - s.x) ** 2 + (d.y - s.y) ** 2 <= R2)) hits++;
    }
    const recall = samples.current.length ? hits / samples.current.length : 0;

    // Precision (drawing stayed on the glyph), distinct covered cells, and
    // path length — together these reject scribbling to fill the letter.
    let onGlyph = 0;
    let pathLen = 0;
    const covered = new Set<string>();
    for (let i = 0; i < pts.length; i++) {
      const d = pts[i];
      if (i > 0) pathLen += Math.hypot(d.x - pts[i - 1].x, d.y - pts[i - 1].y);
      const cx = Math.floor(d.x / 6);
      const cy = Math.floor(d.y / 6);
      let near = false;
      for (let dx = -1; dx <= 1 && !near; dx++) {
        for (let dy = -1; dy <= 1 && !near; dy++) {
          if (onCells.current.has(`${cx + dx}|${cy + dy}`)) near = true;
        }
      }
      if (near) {
        onGlyph++;
        covered.add(`${cx}|${cy}`);
      }
    }
    const precision = pts.length ? onGlyph / pts.length : 0;
    // Overdraw: a clean trace draws roughly the glyph's length; a scribble that
    // fills the letter draws far more path over the same cells.
    const overdraw = pathLen / Math.max(covered.size * 6, 1);

    const TH = {
      easy: { recall: 0.4, precision: 0.55, overdraw: 3.4 },
      medium: { recall: 0.5, precision: 0.65, overdraw: 2.8 },
      hard: { recall: 0.6, precision: 0.72, overdraw: 2.3 },
    }[question.difficulty];

    const ok =
      recall >= TH.recall &&
      precision >= TH.precision &&
      overdraw <= TH.overdraw &&
      pts.length > 12;
    setChecked(ok);
    window.setTimeout(() => onComplete(ok ? "traced" : "miss"), 1200);
  }

  return (
    <>
      <section className="mt-6 flex flex-col items-center rounded-4xl bg-white px-6 py-6 shadow-lg">
        <button
          type="button"
          onClick={() => speak(question.spoken)}
          className={`btn-bounce mb-3 inline-flex items-center gap-2 rounded-full ${accent.soft} px-4 py-2 font-display ${accent.text}`}
        >
          🔊 Say it again
        </button>
        <p className="mb-2 font-display text-lg text-slate-500">
          Trace it with your finger!
        </p>
        <canvas
          ref={canvasRef}
          width={TRACE_SIZE}
          height={TRACE_SIZE}
          onPointerDown={down}
          onPointerMove={moveHandler}
          onPointerUp={up}
          onPointerLeave={up}
          style={{ touchAction: "none" }}
          className={`w-full max-w-[300px] rounded-3xl border-4 ${
            checked === true
              ? "border-emerald-400"
              : checked === false
                ? "border-amber-300"
                : "border-slate-100"
          } bg-slate-50`}
        />
        {checked === true && (
          <p className="mt-3 animate-pop font-display text-xl text-emerald-600">
            Beautiful! ⭐
          </p>
        )}
        {checked === false && (
          <p className="mt-3 font-display text-lg text-slate-500">
            Good try! Trace right over the shape.
          </p>
        )}
      </section>

      <section className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={clear}
          className="btn-bounce rounded-full bg-white px-6 py-3 font-display text-lg font-bold text-slate-500 shadow-md ring-2 ring-slate-100"
        >
          ↺ Clear
        </button>
        <button
          type="button"
          onClick={done}
          className={`btn-bounce rounded-full ${accent.solid} px-8 py-3 font-display text-lg font-bold text-white shadow-md`}
        >
          Done!
        </button>
      </section>
    </>
  );
}

// --- Reward screen ----------------------------------------------------------

function RewardScreen({
  childId,
  gameId,
  color,
  result,
}: {
  childId: string;
  gameId: string;
  color: string;
  result: FinishResult;
}) {
  const accent = accentFor(color);
  return (
    <div className="relative grid flex-1 place-items-center overflow-hidden text-center">
      {result.tokens > 0 &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={`c${i}`}
            className="pointer-events-none absolute top-0 animate-confetti text-xl"
            style={{ left: `${(i * 7) % 100}%`, animationDelay: `${(i % 5) * 0.1}s` }}
            aria-hidden
          >
            {["🎉", "⭐", "🎈", "✨", "🍬"][i % 5]}
          </span>
        ))}
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
        <div className="text-7xl">{result.passed ? "🌟" : "💪"}</div>
        <h2 className={`mt-3 font-display text-4xl font-bold ${accent.text}`}>
          {result.passed ? "You did it!" : "So close!"}
        </h2>
        <p className="mt-2 font-display text-2xl text-slate-600">
          {result.correct} / {result.total} correct
        </p>

        {result.passed ? (
          <div className="mt-5">
            <p className="text-slate-500">You earned</p>
            <div className="mt-1">
              <TokenBadge amount={result.tokens} size="lg" />
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 font-display text-amber-700">
            Get 80% right to earn tokens. Try again! 💪
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {/* Full navigation → a fresh round mounts cleanly. */}
          <a
            href={`/play/${childId}/game/${gameId}`}
            className={`btn-bounce rounded-full ${accent.solid} px-6 py-3 font-display text-lg font-bold text-white shadow-md`}
          >
            🔁 Play again
          </a>
          <Link
            href={`/play/${childId}`}
            className="btn-bounce rounded-full bg-white px-6 py-3 font-display text-lg font-bold text-slate-600 shadow-md ring-2 ring-slate-100"
          >
            🎮 Games
          </Link>
          <Link
            href={`/play/${childId}/prizes`}
            className="btn-bounce rounded-full bg-white px-6 py-3 font-display text-lg font-bold text-slate-600 shadow-md ring-2 ring-slate-100"
          >
            🎁 Prizes
          </Link>
        </div>
      </div>
    </div>
  );
}
