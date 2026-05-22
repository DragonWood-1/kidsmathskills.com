"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RewardPopupProps {
  show: boolean;
  correct: boolean;
  coins?: number;
  xp?: number;
  streak?: number;
  message?: string;
}

const CORRECT_MESSAGES = [
  "Amazing! 🎉", "Brilliant! ⭐", "You rock! 🤘", "Perfect! 💯",
  "Superstar! 🌟", "Fantastic! 🦄", "Awesome! 🎊", "Incredible! 🚀",
];

const WRONG_MESSAGES = [
  "Keep trying! 💪", "Almost there! 🌈", "You got this! 🎯",
  "Don't give up! 🔥", "Try again! 💡",
];

export default function RewardPopup({ show, correct, coins = 5, xp = 10, streak = 0, message }: RewardPopupProps) {
  const msg = message ?? (correct
    ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    : WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-5 rounded-3xl shadow-2xl text-white font-black text-center ${
            correct ? "bg-gradient-to-br from-green-400 to-emerald-500" : "bg-gradient-to-br from-orange-400 to-red-400"
          }`}
        >
          <p className="text-3xl mb-2">{msg}</p>
          {correct && (
            <div className="flex items-center justify-center gap-4 text-lg">
              <span>+{xp} XP ⭐</span>
              <span>+{coins} 🪙</span>
              {streak > 0 && streak % 5 === 0 && <span>🔥 {streak} Streak!</span>}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
