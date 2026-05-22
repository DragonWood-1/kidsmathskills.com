"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProblems, Problem } from "@/lib/mathProblems";
import { recordAnswer } from "@/lib/gameStore";
import RewardPopup from "@/components/rewards/RewardPopup";

interface Animal {
  id: string;
  name: string;
  emoji: string[];
  topic: "counting" | "fractions" | "multiplication" | "time" | "money";
  topicLabel: string;
  feedCount: number;
  evolutions: number;
  maxFeed: number;
  color: string;
}

const INITIAL_ANIMALS: Animal[] = [
  { id: "bunny", name: "Magic Bunny", emoji: ["🐰", "🐇", "🦊"], topic: "counting", topicLabel: "Counting", feedCount: 0, evolutions: 0, maxFeed: 5, color: "from-pink-400 to-rose-500" },
  { id: "dragon", name: "Baby Dragon", emoji: ["🥚", "🐊", "🐉"], topic: "multiplication", topicLabel: "Multiplication", feedCount: 0, evolutions: 0, maxFeed: 5, color: "from-red-500 to-orange-500" },
  { id: "unicorn", name: "Unicorn Foal", emoji: ["🐴", "🦄", "✨"], topic: "fractions", topicLabel: "Fractions", feedCount: 0, evolutions: 0, maxFeed: 5, color: "from-purple-400 to-pink-500" },
  { id: "owl", name: "Wise Owl", emoji: ["🐣", "🦉", "🌟"], topic: "time", topicLabel: "Time", feedCount: 0, evolutions: 0, maxFeed: 5, color: "from-amber-400 to-yellow-500" },
  { id: "dolphin", name: "Dolphin Pup", emoji: ["🐟", "🐬", "🌊"], topic: "money", topicLabel: "Money", feedCount: 0, evolutions: 0, maxFeed: 5, color: "from-cyan-400 to-blue-500" },
];

export default function MathZooClient() {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kms_zoo");
      return saved ? JSON.parse(saved) : INITIAL_ANIMALS;
    }
    return INITIAL_ANIMALS;
  });
  const [selected, setSelected] = useState<Animal | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [feedAnimation, setFeedAnimation] = useState(false);
  const [evolveAnimation, setEvolveAnimation] = useState(false);

  function saveAnimals(updated: Animal[]) {
    setAnimals(updated);
    localStorage.setItem("kms_zoo", JSON.stringify(updated));
  }

  function selectAnimal(animal: Animal) {
    setSelected(animal);
    setProblems(getProblems(animal.topic, 1));
    setProblemIndex(0);
  }

  function handleAnswer(opt: number) {
    if (!selected || !problems[problemIndex]) return;
    const correct = opt === problems[problemIndex].answer;
    recordAnswer(correct, "math-zoo");
    setLastCorrect(correct);
    setShowReward(true);

    if (correct) {
      setFeedAnimation(true);
      setTimeout(() => setFeedAnimation(false), 800);

      const updated = animals.map(a => {
        if (a.id !== selected.id) return a;
        const newFeed = a.feedCount + 1;
        const evolved = newFeed >= a.maxFeed;
        const newAnimal = {
          ...a,
          feedCount: evolved ? 0 : newFeed,
          evolutions: evolved ? Math.min(a.evolutions + 1, 2) : a.evolutions,
        };
        if (evolved) {
          setEvolveAnimation(true);
          setTimeout(() => setEvolveAnimation(false), 2000);
          setSelected(newAnimal);
        } else {
          setSelected(newAnimal);
        }
        return newAnimal;
      });
      saveAnimals(updated);
    }

    setTimeout(() => {
      setShowReward(false);
      if (problemIndex + 1 >= problems.length) {
        setProblems(getProblems(selected.topic, 1));
        setProblemIndex(0);
      } else {
        setProblemIndex(i => i + 1);
      }
    }, 1200);
  }

  const currentProblem = problems[problemIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 via-emerald-700 to-teal-800 py-8 px-4">
      <RewardPopup show={showReward} correct={lastCorrect} />

      <div className="max-w-5xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-5xl font-black mb-2">🦁 Math Zoo</h1>
          <p className="text-green-200 text-lg">Feed your animals with correct answers and watch them evolve!</p>
        </div>

        {!selected ? (
          /* Animal grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {animals.map((animal, i) => (
              <motion.button
                key={animal.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectAnimal(animal)}
                className={`bg-gradient-to-br ${animal.color} rounded-3xl p-5 text-white text-center shadow-xl cursor-pointer`}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl mb-2"
                >
                  {animal.emoji[Math.min(animal.evolutions, 2)]}
                </motion.div>
                <p className="font-black text-sm">{animal.name}</p>
                <p className="text-white/70 text-xs mb-2">{animal.topicLabel}</p>
                {/* Feed progress */}
                <div className="bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${(animal.feedCount / animal.maxFeed) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-1 opacity-70">{animal.feedCount}/{animal.maxFeed} fed</p>
                {animal.evolutions > 0 && (
                  <div className="mt-1 text-xs bg-white/25 rounded-full px-2 py-0.5">
                    ✨ Evolved {animal.evolutions}×
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          /* Active feeding session */
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelected(null)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 font-bold text-sm transition-colors"
              >
                ← Zoo
              </button>
              <div className="text-white">
                <p className="font-black">{selected.emoji[Math.min(selected.evolutions, 2)]} {selected.name}</p>
                <p className="text-green-200 text-xs">{selected.topicLabel} Practice</p>
              </div>
            </div>

            {/* Animal display */}
            <motion.div
              className={`bg-gradient-to-br ${selected.color} rounded-3xl p-8 text-white text-center mb-6 shadow-2xl relative overflow-hidden`}
              animate={feedAnimation ? { scale: [1, 1.1, 1] } : {}}
            >
              {evolveAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [2, 1, 1, 0.5] }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 text-5xl"
                >
                  ✨ EVOLVED! ✨
                </motion.div>
              )}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-3"
              >
                {selected.emoji[Math.min(selected.evolutions, 2)]}
              </motion.div>
              <p className="text-xl font-black mb-1">{selected.name}</p>
              <p className="text-white/80 text-sm mb-4">Feed me with correct answers!</p>
              <div className="bg-white/30 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="bg-white h-4 rounded-full"
                  animate={{ width: `${(selected.feedCount / selected.maxFeed) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm mt-2 opacity-80">🍎 {selected.feedCount}/{selected.maxFeed} — {selected.evolutions < 2 ? "Evolves soon!" : "MAX EVOLVED! ✨"}</p>
            </motion.div>

            {/* Problem */}
            {currentProblem && (
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <p className="text-center text-gray-500 text-sm mb-4 font-semibold">Feed {selected.name} by solving:</p>
                <p className="text-center text-4xl font-black text-gray-900 mb-6">{currentProblem.question}</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentProblem.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-black text-2xl rounded-2xl p-4 hover:scale-105 active:scale-95 transition-transform shadow-md"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
