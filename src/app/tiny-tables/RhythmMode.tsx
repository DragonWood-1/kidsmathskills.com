"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordAnswer } from "@/lib/gameStore";

interface Props {
  table: number;
  onBack: () => void;
}

interface Problem {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

function makeProblem(table: number): Problem {
  const b = Math.floor(Math.random() * 12) + 1;
  const answer = table * b;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 14) - 7);
    if (w > 0 && w !== answer) wrongs.add(w);
  }
  const options = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
  return { a: table, b, answer, options };
}

const TEMPOS = [
  { label: "Slow 🐢", bpm: 40, color: "from-green-500 to-teal-600" },
  { label: "Medium 🐾", bpm: 60, color: "from-blue-500 to-indigo-600" },
  { label: "Fast 🐇", bpm: 90, color: "from-purple-500 to-pink-600" },
  { label: "Blazing 🔥", bpm: 120, color: "from-red-500 to-orange-600" },
];

export default function RhythmMode({ table, onBack }: Props) {
  const [phase, setPhase] = useState<"select" | "playing" | "done">("select");
  const [tempoIdx, setTempoIdx] = useState(0);
  const [beat, setBeat] = useState(false);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(table));
  const [beatCount, setBeatCount] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [totalBeats, setTotalBeats] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | "miss" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const beatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL_BEATS = 20;

  const tempo = TEMPOS[tempoIdx];
  const msPerBeat = Math.round(60000 / tempo.bpm);

  const nextBeat = useCallback(() => {
    setBeatCount(prev => {
      const next = prev + 1;
      if (next > TOTAL_BEATS) {
        clearInterval(beatRef.current!);
        setPhase("done");
        return prev;
      }
      return next;
    });
    setTotalBeats(t => t + 1);
    setBeat(b => !b);

    // Miss if not answered
    setAnswered(prev => {
      if (!prev && beatCount > 0) {
        setMissed(m => m + 1);
        setCombo(0);
        setFlash("miss");
        setTimeout(() => setFlash(null), 300);
        setProblem(makeProblem(table));
      }
      return false;
    });
  }, [beatCount, table]);

  useEffect(() => {
    if (phase !== "playing") return;
    beatRef.current = setInterval(nextBeat, msPerBeat);
    return () => clearInterval(beatRef.current!);
  }, [phase, msPerBeat, nextBeat]);

  function handleAnswer(opt: number) {
    if (answered || phase !== "playing") return;
    const correct = opt === problem.answer;
    setAnswered(true);
    setFlash(correct ? "correct" : "wrong");
    recordAnswer(correct, "tiny-tables");

    if (correct) {
      setScore(s => s + 1);
      setCombo(c => {
        const next = c + 1;
        setMaxCombo(m => Math.max(m, next));
        return next;
      });
    } else {
      setMissed(m => m + 1);
      setCombo(0);
    }

    setTimeout(() => {
      setFlash(null);
      setProblem(makeProblem(table));
    }, 200);
  }

  // Keyboard support
  useEffect(() => {
    if (phase !== "playing") return;
    const handleKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= 4) handleAnswer(problem.options[n - 1]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, problem.options]);

  const accuracy = totalBeats > 0 ? Math.round((score / totalBeats) * 100) : 0;
  const stars = accuracy >= 85 ? 3 : accuracy >= 65 ? 2 : accuracy >= 40 ? 1 : 0;

  // SELECT TEMPO screen
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-500 to-rose-600 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center text-white mb-8">
            <h2 className="text-4xl font-black mb-2">🎵 Rhythm Mode</h2>
            <p className="text-pink-100">Answer on the beat! Choose your tempo:</p>
          </div>
          <div className="space-y-3 mb-6">
            {TEMPOS.map((t, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTempoIdx(i)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-4 transition-all font-bold ${
                  tempoIdx === i
                    ? "bg-white border-white text-gray-900 scale-105"
                    : "bg-white/20 border-white/30 text-white hover:bg-white/30"
                }`}
              >
                <span className="text-lg">{t.label}</span>
                <span className="text-sm opacity-70">{t.bpm} BPM</span>
              </motion.button>
            ))}
          </div>

          {/* Animated beat preview */}
          <BeatPreview bpm={TEMPOS[tempoIdx].bpm} />

          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setPhase("playing"); setScore(0); setMissed(0); setCombo(0); setMaxCombo(0); setBeatCount(0); setTotalBeats(0); setAnswered(false); setProblem(makeProblem(table)); }}
              className="flex-1 bg-white text-pink-600 font-black text-xl py-4 rounded-2xl shadow-lg"
            >
              🎵 Let&apos;s Go!
            </motion.button>
            <button onClick={onBack} className="bg-white/20 text-white font-bold py-4 px-5 rounded-2xl hover:bg-white/30">←</button>
          </div>
        </div>
      </div>
    );
  }

  // DONE screen
  if (phase === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-500 to-rose-600 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="text-6xl mb-3">{stars === 3 ? "🎵" : stars === 2 ? "🎶" : "🎤"}</div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">Rhythm Complete!</h2>
          <p className="text-gray-500 mb-4">{tempo.label} — {table}× table</p>
          <div className="flex justify-center gap-1 text-3xl mb-5">
            {[1, 2, 3].map(s => (
              <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: s <= stars ? 1 : 0.4, opacity: s <= stars ? 1 : 0.2 }} transition={{ delay: s * 0.15 }}>⭐</motion.span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-black text-green-600">{score}</p>
              <p className="text-xs text-gray-500">On Beat</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-black text-red-500">{missed}</p>
              <p className="text-xs text-gray-500">Missed</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-black text-blue-600">{accuracy}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-black text-purple-600">{maxCombo}×</p>
              <p className="text-xs text-gray-500">Max Combo</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setPhase("select"); }}
              className="flex-1 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-lg py-4 rounded-2xl"
            >
              🔄 Play Again
            </button>
            <button onClick={onBack} className="bg-gray-100 text-gray-600 font-bold py-4 px-5 rounded-2xl hover:bg-gray-200">←</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING screen
  const bgColor = flash === "correct" ? "bg-green-400" : flash === "wrong" ? "bg-red-400" : flash === "miss" ? "bg-gray-500" : `bg-gradient-to-b ${tempo.color}`;

  return (
    <div className={`min-h-screen transition-colors duration-100 ${bgColor} py-6 px-4`}>
      <div className="max-w-md mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-2xl font-black">{score}</p>
            <p className="text-xs">on beat</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-70 mb-1">{beatCount}/{TOTAL_BEATS} beats</p>
            {combo >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-400 text-yellow-900 rounded-full px-3 py-0.5 text-xs font-black"
              >
                🔥 {combo}× COMBO!
              </motion.div>
            )}
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-2xl font-black">{missed}</p>
            <p className="text-xs">missed</p>
          </div>
        </div>

        {/* Beat progress */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${i < beatCount ? "bg-white" : "bg-white/25"}`}
            />
          ))}
        </div>

        {/* Beat pulse indicator */}
        <motion.div
          animate={{ scale: beat ? 1.15 : 1, opacity: beat ? 1 : 0.6 }}
          transition={{ duration: 0.1 }}
          className="w-16 h-16 bg-white/30 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
        >
          🎵
        </motion.div>

        {/* Problem */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${problem.a}x${problem.b}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-3xl p-7 text-center shadow-2xl mb-5"
          >
            <p className="text-3xl sm:text-5xl font-black text-gray-900">{problem.a} × {problem.b} = ?</p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {problem.options.map((opt, i) => (
            <motion.button
              key={`${opt}-${i}`}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleAnswer(opt)}
              className="bg-white text-gray-900 font-black text-xl sm:text-3xl rounded-2xl py-4 sm:py-5 shadow-lg hover:shadow-xl relative"
            >
              <span className="absolute top-1 left-2 text-xs text-gray-300">{i + 1}</span>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeatPreview({ bpm }: { bpm: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ms = Math.round(60000 / bpm);
    const t = setInterval(() => setOn(v => !v), ms);
    return () => clearInterval(t);
  }, [bpm]);

  return (
    <div className="flex items-center justify-center gap-3 bg-white/15 rounded-2xl p-4">
      <motion.div
        animate={{ scale: on ? 1.4 : 1, opacity: on ? 1 : 0.5 }}
        transition={{ duration: 0.05 }}
        className="w-8 h-8 bg-white rounded-full"
      />
      <p className="text-white text-sm font-bold">Beat preview at {bpm} BPM</p>
    </div>
  );
}
