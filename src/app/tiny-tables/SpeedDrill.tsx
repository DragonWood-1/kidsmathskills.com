"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordAnswer } from "@/lib/gameStore";
import { saveScore } from "./TinyTablesClient";

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
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w > 0 && w !== answer) wrongs.add(w);
  }
  const options = [answer, ...Array.from(wrongs)].sort(() => Math.random() - 0.5);
  return { a: table, b, answer, options };
}

const DRILL_SECONDS = 60;

export default function SpeedDrill({ table, onBack }: Props) {
  const [phase, setPhase] = useState<"ready" | "countdown" | "playing" | "done">("ready");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(DRILL_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(table));
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Load high score for this table
    const lb = JSON.parse(localStorage.getItem("kms_tinytables_lb") || "[]");
    const tableScores = lb.filter((s: { table: number }) => s.table === table);
    if (tableScores.length > 0) setHighScore(tableScores[0].score);
  }, [table]);

  // Countdown phase
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { setPhase("playing"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Game timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const handleAnswer = useCallback((opt: number) => {
    if (phase !== "playing") return;
    const correct = opt === problem.answer;
    setFlash(correct ? "correct" : "wrong");
    setTotalAnswered(t => t + 1);
    recordAnswer(correct, "tiny-tables");

    if (correct) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setFlash(null);
      setProblem(makeProblem(table));
    }, 300);
  }, [phase, problem.answer, table]);

  // Keyboard support
  useEffect(() => {
    if (phase !== "playing") return;
    const handleKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= 4) {
        handleAnswer(problem.options[n - 1]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, problem.options, handleAnswer]);

  function startDrill() {
    setPhase("countdown");
    setCountdown(3);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(DRILL_SECONDS);
    setTotalAnswered(0);
    setProblem(makeProblem(table));
  }

  function handleDone() {
    saveScore(table, score);
    // Update high score display
    if (score > highScore) setHighScore(score);
  }

  useEffect(() => {
    if (phase === "done") handleDone();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const timePercent = (timeLeft / DRILL_SECONDS) * 100;
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const isNewRecord = score > highScore && phase === "done";

  // READY screen
  if (phase === "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-orange-500 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl"
        >
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{table}× Speed Drill</h2>
          <p className="text-gray-500 mb-6">Answer as many <span className="font-bold text-orange-500">{table}× problems</span> as you can in 60 seconds!</p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-gray-600">⏱️ 60 seconds on the clock</p>
            <p className="text-sm text-gray-600">🎯 Tap the correct answer fast</p>
            <p className="text-sm text-gray-600">⌨️ Or press keys 1–4 on keyboard</p>
            <p className="text-sm text-gray-600">🏆 High score: <strong className="text-orange-600">{highScore} correct</strong></p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startDrill}
              className="flex-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Start! ⚡
            </motion.button>
            <button onClick={onBack} className="bg-gray-100 text-gray-600 font-bold py-4 px-5 rounded-2xl hover:bg-gray-200 transition-colors">
              ←
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // COUNTDOWN screen
  if (phase === "countdown") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-orange-500 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-white font-black text-center"
          >
            {countdown > 0 ? (
              <>
                <p className="text-[5rem] sm:text-[8rem] md:text-[10rem] leading-none drop-shadow-2xl">{countdown}</p>
                <p className="text-2xl mt-2">Get ready!</p>
              </>
            ) : (
              <>
                <p className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] leading-none drop-shadow-2xl">GO!</p>
                <p className="text-2xl mt-2">⚡</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // DONE screen
  if (phase === "done") {
    const stars = score >= 20 ? 3 : score >= 12 ? 2 : score >= 6 ? 1 : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-400 to-orange-500 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl"
        >
          {isNewRecord && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 font-black mb-4 text-lg"
            >
              🏆 NEW RECORD!
            </motion.div>
          )}
          <div className="text-6xl mb-3">{stars === 3 ? "🏆" : stars === 2 ? "🥈" : stars === 1 ? "🥉" : "💪"}</div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">Time&apos;s Up!</h2>
          <div className="flex justify-center gap-1 text-4xl mb-5">
            {[1, 2, 3].map(s => (
              <motion.span
                key={s}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: s <= stars ? 1 : 0.4, rotate: 0, opacity: s <= stars ? 1 : 0.25 }}
                transition={{ delay: s * 0.15 }}
              >⭐</motion.span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-orange-50 rounded-2xl p-3">
              <p className="text-3xl font-black text-orange-600">{score}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-3xl font-black text-blue-600">{accuracy}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3">
              <p className="text-3xl font-black text-purple-600">{bestStreak}</p>
              <p className="text-xs text-gray-500">Best Streak</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            High score for {table}× table: <strong className="text-orange-600">{Math.max(score, highScore)}</strong>
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startDrill}
              className="flex-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-lg py-4 rounded-2xl"
            >
              🔄 Try Again
            </motion.button>
            <button onClick={onBack} className="bg-gray-100 text-gray-600 font-bold py-4 px-5 rounded-2xl hover:bg-gray-200 transition-colors">
              ←
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING screen
  return (
    <div
      className={`min-h-screen transition-colors duration-150 ${
        flash === "correct" ? "bg-green-400" : flash === "wrong" ? "bg-red-400" : "bg-gradient-to-b from-yellow-400 to-orange-500"
      } py-6 px-4`}
    >
      <div className="max-w-md mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-3xl font-black">{score}</p>
            <p className="text-xs opacity-80">correct</p>
          </div>
          <div className="text-center">
            <p className={`text-4xl sm:text-5xl font-black drop-shadow-lg ${timeLeft <= 10 ? "text-red-200 animate-pulse" : ""}`}>
              {timeLeft}
            </p>
            <p className="text-xs opacity-80">seconds</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-3xl font-black">🔥{streak}</p>
            <p className="text-xs opacity-80">streak</p>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-3 bg-white/30 rounded-full mb-6 overflow-hidden">
          <motion.div
            className={`h-3 rounded-full transition-colors ${timeLeft > 20 ? "bg-white" : "bg-red-300"}`}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Problem */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${problem.a}x${problem.b}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-3xl p-8 text-center shadow-2xl mb-6"
          >
            <p className="text-gray-400 text-sm mb-1 font-semibold">{table}× table</p>
            <p className="text-4xl sm:text-6xl font-black text-gray-900">{problem.a} × {problem.b}</p>
            <p className="text-2xl sm:text-4xl font-black text-gray-300 mt-2">= ?</p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {problem.options.map((opt, i) => (
            <motion.button
              key={`${opt}-${i}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAnswer(opt)}
              className="bg-white text-gray-900 font-black text-xl sm:text-3xl rounded-2xl py-4 sm:py-5 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              <span className="absolute top-1 left-2 text-xs text-gray-300 font-normal">{i + 1}</span>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
