"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProblems } from "@/lib/mathProblems";
import { recordAnswer } from "@/lib/gameStore";
import RewardPopup from "@/components/rewards/RewardPopup";

const PLANETS = [
  { id: "mercury", name: "Mercury", emoji: "🔴", topic: "addition" as const, desc: "Simple addition missions", color: "from-red-500 to-rose-600", time: 15 },
  { id: "venus", name: "Venus", emoji: "🟠", topic: "subtraction" as const, desc: "Subtraction launch sequence", color: "from-orange-400 to-amber-500", time: 15 },
  { id: "earth", name: "Earth", emoji: "🌍", topic: "multiplication" as const, desc: "Times table orbit", color: "from-blue-500 to-cyan-500", time: 12 },
  { id: "mars", name: "Mars", emoji: "🔵", topic: "division" as const, desc: "Division warp drive", color: "from-violet-500 to-indigo-600", time: 12 },
  { id: "jupiter", name: "Jupiter", emoji: "🟤", topic: "fractions" as const, desc: "Fraction black hole", color: "from-amber-600 to-yellow-700", time: 20 },
  { id: "saturn", name: "Saturn", emoji: "🪐", topic: "money" as const, desc: "Money space trade", color: "from-yellow-500 to-orange-500", time: 20 },
];

export default function RocketMathClient() {
  const [selectedPlanet, setSelectedPlanet] = useState<typeof PLANETS[0] | null>(null);
  const [problems, setProblems] = useState<ReturnType<typeof getProblems>>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [missionActive, setMissionActive] = useState(false);
  const [missionDone, setMissionDone] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startMission(planet: typeof PLANETS[0]) {
    setSelectedPlanet(planet);
    setProblems(getProblems(planet.topic, 2));
    setIndex(0);
    setScore(0);
    setTimeLeft(planet.time);
    setMissionActive(true);
    setMissionDone(false);
    setSelectedOpt(null);
  }

  useEffect(() => {
    if (!missionActive || missionDone) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setMissionActive(false);
          setMissionDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [missionActive, missionDone, index]);

  function handleAnswer(opt: number) {
    if (selectedOpt !== null || !missionActive) return;
    clearInterval(timerRef.current!);
    const correct = opt === problems[index]?.answer;
    setSelectedOpt(opt);
    setLastCorrect(correct);
    setShowReward(true);
    recordAnswer(correct, "rocket-math");
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      setShowReward(false);
      setSelectedOpt(null);
      if (index + 1 >= problems.length) {
        setMissionActive(false);
        setMissionDone(true);
      } else {
        setIndex(i => i + 1);
        setTimeLeft(selectedPlanet!.time);
      }
    }, 1000);
  }

  const currentProblem = problems[index];
  const timePercent = selectedPlanet ? (timeLeft / selectedPlanet.time) * 100 : 100;
  const stars = score >= 8 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0;

  if (missionDone && selectedPlanet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-black py-16 px-4 flex items-center">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`bg-gradient-to-br ${selectedPlanet.color} rounded-3xl p-8 text-white shadow-2xl`}
          >
            <p className="text-6xl mb-4">{stars >= 2 ? "🏆" : "🚀"}</p>
            <h2 className="text-3xl font-black mb-2">Mission {stars >= 3 ? "Complete!" : "Finished!"}</h2>
            <div className="flex justify-center gap-1 text-3xl mb-4">
              {[1, 2, 3].map(s => (
                <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: s <= stars ? 1 : 0.4, opacity: s <= stars ? 1 : 0.3 }} transition={{ delay: s * 0.2 }}>⭐</motion.span>
              ))}
            </div>
            <p className="text-5xl font-black mb-2">{score}/{problems.length}</p>
            <p className="opacity-80 mb-6">Problems solved correctly</p>
            <div className="flex gap-3">
              <button onClick={() => startMission(selectedPlanet)} className="flex-1 bg-white/20 hover:bg-white/30 rounded-2xl py-3 font-bold transition-colors">🔄 Retry</button>
              <button onClick={() => { setSelectedPlanet(null); setMissionDone(false); }} className="flex-1 bg-white text-gray-900 rounded-2xl py-3 font-bold hover:bg-gray-100 transition-colors">🚀 Planets</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (selectedPlanet && missionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-black py-8 px-4">
        <RewardPopup show={showReward} correct={lastCorrect} />
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{selectedPlanet.emoji}</span>
              <div>
                <p className="font-black">{selectedPlanet.name} Mission</p>
                <p className="text-gray-400 text-xs">Problem {index + 1}/{problems.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-black text-yellow-300 text-2xl">{timeLeft}s</p>
                <p className="text-gray-400 text-xs">remaining</p>
              </div>
              <div className="bg-green-400 text-green-900 rounded-full px-3 py-1 font-bold text-sm">
                ✅ {score}
              </div>
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-3 bg-white/10 rounded-full mb-6 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${timePercent > 50 ? "bg-green-400" : timePercent > 25 ? "bg-yellow-400" : "bg-red-400"}`}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Problem */}
          {currentProblem && (
            <div>
              <div className={`bg-gradient-to-br ${selectedPlanet.color} rounded-3xl p-8 text-white text-center mb-6 shadow-xl`}>
                <p className="text-5xl font-black">{currentProblem.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentProblem.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedOpt !== null}
                    className={`font-black text-3xl rounded-2xl p-5 transition-all border-4 ${
                      selectedOpt === null
                        ? "bg-white border-gray-200 text-gray-800 hover:border-indigo-400 hover:scale-105"
                        : opt === currentProblem.answer
                          ? "bg-green-400 border-green-600 text-white scale-105"
                          : opt === selectedOpt
                            ? "bg-red-400 border-red-600 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-500"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-indigo-950 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white mb-10">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black mb-3">
            🚀 Rocket Math Academy
          </motion.h1>
          <p className="text-indigo-300 text-lg">Choose a planet mission. Solve fast — you're racing against the clock!</p>
          <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
            <span className="bg-white/10 rounded-full px-4 py-1">⏱️ Timed Missions</span>
            <span className="bg-white/10 rounded-full px-4 py-1">🪐 6 Planets</span>
            <span className="bg-white/10 rounded-full px-4 py-1">⭐ Star Ratings</span>
          </div>
        </div>

        {/* Solar system */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {PLANETS.map((planet, i) => (
            <motion.button
              key={planet.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startMission(planet)}
              className={`bg-gradient-to-br ${planet.color} text-white rounded-3xl p-6 text-left shadow-xl cursor-pointer`}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                {planet.emoji}
              </motion.div>
              <h3 className="font-black text-lg mb-1">{planet.name}</h3>
              <p className="text-white/80 text-xs mb-3">{planet.desc}</p>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-white/25 rounded-full px-3 py-1">⏱️ {planet.time}s per problem</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* AI Tutor tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/10 backdrop-blur rounded-3xl p-6 text-white text-center border border-white/20"
        >
          <p className="text-2xl mb-2">🤖 AI Math Tutor Says:</p>
          <p className="text-indigo-200">"Start with Mercury and work your way up! Each planet teaches a new skill. The faster you answer, the more stars you earn!"</p>
        </motion.div>
      </div>
    </div>
  );
}
