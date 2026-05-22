"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MathProblem from "./MathProblem";
import RewardPopup from "@/components/rewards/RewardPopup";
import { Problem, PracticeType, getProblems } from "@/lib/mathProblems";
import { recordAnswer, getStats } from "@/lib/gameStore";

interface GameSessionProps {
  type: PracticeType;
  title: string;
  emoji: string;
  color: string;
  world?: string;
}

export default function GameSession({ type, title, emoji, color, world }: GameSessionProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [showReward, setShowReward] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [coins, setCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [adaptCount, setAdaptCount] = useState(0);

  useEffect(() => {
    setProblems(getProblems(type, difficulty));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setDone(false);
    setCoins(0);
    setTotalXP(0);
    setWrongCount(0);
    setAdaptCount(0);
  }, [type, difficulty]);

  const handleAnswer = useCallback((correct: boolean) => {
    const stats = recordAnswer(correct, world);
    setLastCorrect(correct);
    setShowReward(true);

    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setCoins(c => c + 5 + (stats.streak % 5 === 0 && stats.streak > 0 ? 20 : 0));
      setTotalXP(x => x + 10);
      setWrongCount(0);
    } else {
      setStreak(0);
      setWrongCount(w => w + 1);
    }

    setAdaptCount(a => a + 1);

    setTimeout(() => {
      setShowReward(false);
      if (index + 1 >= problems.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 1200);
  }, [index, problems.length, world]);

  // Adaptive difficulty
  useEffect(() => {
    if (adaptCount > 0 && adaptCount % 5 === 0) {
      const ratio = score / adaptCount;
      if (ratio >= 0.8 && difficulty < 3) setDifficulty(d => d + 1);
      else if (ratio <= 0.4 && difficulty > 1) setDifficulty(d => d - 1);
    }
  }, [adaptCount, score, difficulty]);

  function restart() {
    setProblems(getProblems(type, difficulty));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setDone(false);
    setCoins(0);
    setTotalXP(0);
    setWrongCount(0);
    setAdaptCount(0);
  }

  const accuracy = adaptCount > 0 ? Math.round((score / adaptCount) * 100) : 0;
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className={`${color} rounded-3xl p-8 text-white shadow-2xl mb-6`}>
          <p className="text-6xl mb-4">
            {stars === 3 ? "🏆" : stars === 2 ? "🥈" : stars === 1 ? "🥉" : "💪"}
          </p>
          <h2 className="text-3xl font-black mb-2">Round Complete!</h2>
          <div className="flex justify-center gap-1 text-4xl mb-4">
            {[1, 2, 3].map(s => (
              <motion.span
                key={s}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: s <= stars ? 1 : 0.5, rotate: 0, opacity: s <= stars ? 1 : 0.3 }}
                transition={{ delay: s * 0.2 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/20 rounded-2xl p-3">
              <p className="text-2xl font-black">{score}/{problems.length}</p>
              <p className="text-sm opacity-80">Correct</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <p className="text-2xl font-black">{accuracy}%</p>
              <p className="text-sm opacity-80">Accuracy</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <p className="text-2xl font-black">+{totalXP}</p>
              <p className="text-sm opacity-80">XP Earned</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 text-lg font-bold">
            <span className="bg-yellow-400 text-yellow-900 rounded-full px-4 py-1">🪙 +{coins} coins</span>
            {streak >= 5 && <span className="bg-orange-400 text-orange-900 rounded-full px-4 py-1">🔥 {streak} streak!</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className={`flex-1 ${color} text-white font-black text-lg py-4 rounded-2xl hover:opacity-90 active:scale-95 transition-all`}
          >
            🔄 Play Again
          </button>
          <a
            href="/"
            className="flex-1 bg-gray-100 text-gray-700 font-black text-lg py-4 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-center"
          >
            🏠 Home
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <RewardPopup show={showReward} correct={lastCorrect} streak={streak} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">{emoji}</span>
          <div>
            <p className="font-black text-gray-800 text-sm sm:text-base">{title}</p>
            <p className="text-xs text-gray-500">Lv.{difficulty} · {index + 1}/{problems.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 font-bold rounded-full px-3 py-1 text-sm">
            🔥 {streak}
          </span>
          <span className="bg-green-100 text-green-700 font-bold rounded-full px-3 py-1 text-sm">
            ✅ {score}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((index) / problems.length) * 100}%` }}
        />
      </div>

      {/* Problem */}
      <AnimatePresence mode="wait">
        {problems[index] && (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <MathProblem
              problem={problems[index]}
              onAnswer={handleAnswer}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
