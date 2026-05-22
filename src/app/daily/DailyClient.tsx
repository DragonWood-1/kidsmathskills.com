"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { recordAnswer } from "@/lib/gameStore";

// ─── Seeded RNG ──────────────────────────────────────────────────────────────
// Mulberry32 — deterministic, date-seeded so everyone gets the same challenge
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(dateStr: string): number {
  return dateStr.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Problem generation ───────────────────────────────────────────────────────
interface Problem {
  question: string;
  answer: number;
  options: number[];
  hint: string;
  type: string;
  emoji: string;
}

function makeOptions(answer: number, rand: () => number): number[] {
  const offsets = seededShuffle([1, 2, 3, 5, 10, -1, -2, -3, -5, 7, -7, 4], rand);
  const wrong = new Set<number>();
  for (const o of offsets) {
    const w = answer + o;
    if (w >= 0 && w !== answer) wrong.add(w);
    if (wrong.size >= 3) break;
  }
  while (wrong.size < 3) {
    const w = Math.max(0, answer + Math.floor(rand() * 10) - 4);
    if (w !== answer) wrong.add(w);
  }
  return seededShuffle([answer, ...Array.from(wrong).slice(0, 3)], rand);
}

function generateDailyProblems(dateStr: string): Problem[] {
  const rand = mulberry32(dateSeed(dateStr));

  const templates: ((r: () => number) => Problem)[] = [
    // Addition
    (r) => {
      const max = 20 + Math.floor(r() * 80);
      const a = Math.floor(r() * max) + 1;
      const b = Math.floor(r() * max) + 1;
      const answer = a + b;
      return { question: `${a} + ${b} = ?`, answer, options: makeOptions(answer, r), hint: `Count up from ${a}`, type: "Addition", emoji: "➕" };
    },
    // Subtraction
    (r) => {
      const b = Math.floor(r() * 20) + 1;
      const a = b + Math.floor(r() * 20) + 1;
      const answer = a - b;
      return { question: `${a} − ${b} = ?`, answer, options: makeOptions(answer, r), hint: `Start at ${a}, count back ${b}`, type: "Subtraction", emoji: "➖" };
    },
    // Multiplication
    (r) => {
      const a = Math.floor(r() * 11) + 2;
      const b = Math.floor(r() * 11) + 2;
      const answer = a * b;
      return { question: `${a} × ${b} = ?`, answer, options: makeOptions(answer, r), hint: `${a} groups of ${b}`, type: "Multiplication", emoji: "✖️" };
    },
    // Division
    (r) => {
      const b = Math.floor(r() * 10) + 2;
      const answer = Math.floor(r() * 10) + 1;
      const a = b * answer;
      return { question: `${a} ÷ ${b} = ?`, answer, options: makeOptions(answer, r), hint: `How many groups of ${b} fit in ${a}?`, type: "Division", emoji: "➗" };
    },
    // Missing number
    (r) => {
      const a = Math.floor(r() * 15) + 1;
      const b = Math.floor(r() * 15) + 1;
      const total = a + b;
      const answer = b;
      return { question: `${a} + __ = ${total}`, answer, options: makeOptions(answer, r), hint: `${total} − ${a} = ?`, type: "Missing Number", emoji: "🔍" };
    },
    // Word problem — apples
    (r) => {
      const a = Math.floor(r() * 12) + 3;
      const b = Math.floor(r() * a) + 1;
      const answer = a - b;
      return { question: `Captain Starfish had ${a} gold coins. He spent ${b} at the shop. How many does he have left?`, answer, options: makeOptions(answer, r), hint: `${a} − ${b}`, type: "Word Problem", emoji: "📖" };
    },
    // Doubles
    (r) => {
      const a = Math.floor(r() * 15) + 2;
      const answer = a * 2;
      return { question: `Double ${a} = ?`, answer, options: makeOptions(answer, r), hint: `${a} + ${a}`, type: "Doubles", emoji: "🪞" };
    },
    // Halves
    (r) => {
      const answer = Math.floor(r() * 15) + 2;
      const a = answer * 2;
      return { question: `Half of ${a} = ?`, answer, options: makeOptions(answer, r), hint: `${a} ÷ 2`, type: "Halves", emoji: "½" };
    },
    // Times 10
    (r) => {
      const a = Math.floor(r() * 12) + 2;
      const answer = a * 10;
      return { question: `${a} × 10 = ?`, answer, options: makeOptions(answer, r), hint: "Add a zero!", type: "×10", emoji: "🔟" };
    },
    // Word problem — sharing
    (r) => {
      const total = (Math.floor(r() * 6) + 2) * (Math.floor(r() * 5) + 2);
      const friends = Math.floor(r() * 5) + 2;
      const answer = total / friends;
      return { question: `${total} star stickers shared equally among ${friends} friends. How many each?`, answer, options: makeOptions(answer, r), hint: `${total} ÷ ${friends}`, type: "Word Problem", emoji: "⭐" };
    },
  ];

  const picked = seededShuffle(templates, rand).slice(0, 5);
  return picked.map((fn) => fn(rand));
}

// ─── Streak / storage ─────────────────────────────────────────────────────────
interface DailyRecord {
  date: string;
  score: number;
  completed: boolean;
}

const STORAGE_KEY = "kms_daily";

function loadRecords(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveRecord(record: DailyRecord) {
  const records = loadRecords().filter((r) => r.date !== record.date);
  records.push(record);
  // keep last 90 days
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
  const pruned = records.filter((r) => new Date(r.date) >= cutoff);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
}

function calcStreak(records: DailyRecord[], today: string): number {
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (!records.find((r) => r.date === ds && r.completed)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getLast30Days(today: string): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

// ─── Countdown to midnight ────────────────────────────────────────────────────
function useCountdown() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
      setSecs(Math.floor((midnight.getTime() - now.getTime()) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Stars helper ─────────────────────────────────────────────────────────────
const STAR_THRESHOLDS = [0, 3, 5]; // 1 star: any complete, 2: 3+, 3: all 5

// ─── Main component ───────────────────────────────────────────────────────────
export default function DailyClient() {
  const today = new Date().toISOString().slice(0, 10);
  const problems = generateDailyProblems(today);

  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const countdown = useCountdown();

  useEffect(() => {
    const r = loadRecords();
    setRecords(r);
    setStreak(calcStreak(r, today));
    if (r.find((rec) => rec.date === today && rec.completed)) setPhase("done");
  }, [today]);

  const todayRecord = records.find((r) => r.date === today);
  const last30 = getLast30Days(today);

  function answer(opt: number) {
    if (feedback) return;
    setSelectedOption(opt);
    const correct = opt === problems[current].answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => s + 1);
      recordAnswer(true, "daily");
    } else {
      recordAnswer(false, "daily");
    }
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setShowHint(false);
      if (current + 1 >= problems.length) {
        const newScore = score + (correct ? 1 : 0);
        const rec: DailyRecord = { date: today, score: newScore, completed: true };
        saveRecord(rec);
        const updated = [...records.filter((r) => r.date !== today), rec];
        setRecords(updated);
        setStreak(calcStreak(updated, today));
        setPhase("done");
      } else {
        setCurrent((c) => c + 1);
      }
    }, 1100);
  }

  const stars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;

  const problem = problems[current];
  const dateLabel = new Date(today + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white text-sm font-semibold">← Home</Link>
            <div className="w-px h-5 bg-white/30" />
            <span className="text-3xl">🌅</span>
            <div>
              <h1 className="font-black text-xl leading-none">Daily Challenge</h1>
              <p className="text-amber-100 text-xs">{dateLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-amber-100">🔥 Streak</p>
              <p className="font-black text-2xl leading-none">{streak}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-amber-100">Next challenge</p>
              <p className="font-black text-lg leading-none tabular-nums">{countdown}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ── Intro ── */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.8, delay: 0.3 }} className="text-7xl mb-4">🌅</motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Today&apos;s Challenge is Ready!</h2>
                <p className="text-gray-600">5 fresh math problems. Can you get them all? 🌟</p>
              </div>

              {/* Streak motivator */}
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 mb-6 text-center">
                {streak > 0 ? (
                  <>
                    <p className="text-5xl mb-2">🔥</p>
                    <p className="text-2xl font-black text-orange-600">{streak}-day streak!</p>
                    <p className="text-gray-500 mt-1">Keep it going — don&apos;t break the chain!</p>
                  </>
                ) : (
                  <>
                    <p className="text-5xl mb-2">🎯</p>
                    <p className="text-2xl font-black text-gray-800">Start your streak today!</p>
                    <p className="text-gray-500 mt-1">Complete the daily challenge every day to build your streak.</p>
                  </>
                )}
              </div>

              {/* Prizes */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { stars: 1, label: "1+ correct", reward: "+50 XP, +10 🪙" },
                  { stars: 2, label: "3+ correct", reward: "+100 XP, +25 🪙" },
                  { stars: 3, label: "All 5 correct", reward: "+200 XP, +50 🪙 🎉" },
                ].map(({ stars, label, reward }) => (
                  <div key={stars} className="bg-white rounded-2xl border border-amber-100 p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1">{"⭐".repeat(stars)}</div>
                    <p className="text-xs font-bold text-gray-600">{label}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-1">{reward}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhase("playing")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xl py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Start Today&apos;s Challenge! 🚀
              </button>
            </motion.div>
          )}

          {/* ── Playing ── */}
          {phase === "playing" && (
            <motion.div key={`q-${current}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-6">
                {problems.map((_, i) => (
                  <div key={i} className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                    i < current ? "bg-green-400" : i === current ? "bg-amber-400" : "bg-gray-200"
                  }`} />
                ))}
                <span className="text-sm font-black text-gray-500 ml-1">{current + 1}/5</span>
              </div>

              {/* Problem card */}
              <div className={`rounded-3xl p-8 mb-5 shadow-lg border-4 transition-all duration-300 ${
                feedback === "correct" ? "bg-green-50 border-green-400" :
                feedback === "wrong" ? "bg-red-50 border-red-400" :
                "bg-white border-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{problem.emoji}</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    {problem.type}
                  </span>
                  <span className="ml-auto text-2xl font-black text-gray-300">#{current + 1}</span>
                </div>
                <p className="text-3xl font-black text-gray-900 leading-relaxed mb-2">{problem.question}</p>
                {feedback === "correct" && <p className="text-green-600 font-black text-lg">🎉 Correct! Amazing!</p>}
                {feedback === "wrong" && <p className="text-red-600 font-black text-lg">Oops! The answer was {problem.answer} — keep going!</p>}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {problem.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === problem.answer;
                  let cls = "bg-white border-2 border-gray-200 text-gray-800 hover:border-amber-400 hover:bg-amber-50";
                  if (feedback && isSelected && isCorrect) cls = "bg-green-500 border-green-500 text-white scale-105";
                  else if (feedback && isSelected && !isCorrect) cls = "bg-red-400 border-red-400 text-white";
                  else if (feedback && isCorrect) cls = "bg-green-100 border-green-400 text-green-800";
                  return (
                    <button
                      key={opt}
                      onClick={() => answer(opt)}
                      disabled={!!feedback}
                      className={`rounded-2xl py-5 text-2xl font-black transition-all duration-150 shadow-sm ${cls} disabled:cursor-default`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Hint */}
              <div className="text-center">
                {!showHint ? (
                  <button onClick={() => setShowHint(true)} className="text-amber-500 hover:text-amber-700 text-sm font-semibold transition-colors">
                    💡 Show hint
                  </button>
                ) : (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-700 bg-amber-100 rounded-xl px-4 py-2 text-sm font-semibold inline-block">
                    💡 {problem.hint}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Confetti-style star burst */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8 }}
                  className="text-7xl mb-3"
                >
                  {stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🥉"}
                </motion.div>
                <div className="flex justify-center gap-1 text-4xl mb-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: i < stars ? 1 : 0.5 }} transition={{ delay: i * 0.2 }}>
                      {i < stars ? "⭐" : "☆"}
                    </motion.span>
                  ))}
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">
                  {todayRecord ? `${todayRecord.score}/5 correct!` : `${score}/5 correct!`}
                </h2>
                <p className="text-gray-500">
                  {stars === 3 ? "Perfect score! You're a math superstar! 🌟" :
                   stars === 2 ? "Great work! Almost perfect! 💪" :
                   "Good effort! Come back tomorrow! 🌅"}
                </p>
              </div>

              {/* Streak */}
              {streak > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-3xl p-5 text-center mb-6 shadow-lg">
                  <p className="text-4xl mb-1">🔥</p>
                  <p className="font-black text-2xl">{streak}-Day Streak!</p>
                  <p className="text-orange-100 text-sm">Come back tomorrow to keep it going!</p>
                </motion.div>
              )}

              {/* Calendar */}
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-5 mb-6">
                <h3 className="font-black text-gray-700 mb-3">📅 Last 30 Days</h3>
                <div className="grid grid-cols-10 gap-1.5">
                  {last30.map((d) => {
                    const rec = records.find((r) => r.date === d);
                    const isToday = d === today;
                    return (
                      <div
                        key={d}
                        title={`${d}${rec ? ` — ${rec.score}/5` : ""}`}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          rec?.completed
                            ? rec.score >= 5 ? "bg-amber-400 text-white" :
                              rec.score >= 3 ? "bg-green-400 text-white" : "bg-blue-400 text-white"
                            : isToday ? "bg-amber-100 text-amber-600 ring-2 ring-amber-400"
                            : "bg-gray-100 text-gray-300"
                        }`}
                      >
                        {rec?.completed ? (rec.score >= 5 ? "⭐" : rec.score >= 3 ? "✓" : "·") : isToday ? "●" : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> 5/5 Perfect</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> 3–4 correct</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> 1–2 correct</span>
                </div>
              </div>

              {/* Next challenge countdown */}
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-5 text-center mb-6">
                <p className="text-gray-400 text-sm mb-1">Next challenge in</p>
                <p className="font-black text-4xl tabular-nums text-amber-600">{countdown}</p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/practice/multiplication"
                  className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity shadow">
                  ✏️ Keep Practicing
                </Link>
                <Link href="/mathbuddy"
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity shadow">
                  🤖 Ask MathBuddy
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
