import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Math Worlds - KidsMathSkills",
  description: "Choose your math adventure world! 5 unique worlds with games, rewards, and math challenges for kids K-6.",
};

const worlds = [
  { href: "/worlds/number-quest", emoji: "🗺️", title: "Number Quest", desc: "Travel through magical islands and unlock math powers!", grade: "K–3", bg: "from-orange-400 to-rose-500" },
  { href: "/worlds/math-zoo", emoji: "🦁", title: "Math Zoo", desc: "Feed and evolve magical animals with correct answers!", grade: "K–2", bg: "from-green-400 to-teal-500" },
  { href: "/worlds/rocket-math", emoji: "🚀", title: "Rocket Math", desc: "Blast through space missions and race against friends!", grade: "2–5", bg: "from-blue-500 to-indigo-600" },
  { href: "/worlds/math-kingdom", emoji: "🏰", title: "Math Kingdom", desc: "Build your castle by solving math problems!", grade: "2–6", bg: "from-purple-500 to-violet-600" },
  { href: "/worlds/treasure-math", emoji: "🏴‍☠️", title: "Treasure Math", desc: "Pirate adventure! Solve clues to find hidden treasure!", grade: "1–4", bg: "from-yellow-500 to-orange-500" },
];

export default function WorldsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Choose Your World! 🌍</h1>
          <p className="text-gray-600 text-xl">Pick an adventure and start learning math through play!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((w) => (
            <Link key={w.href} href={w.href} className="world-card block">
              <div className={`bg-gradient-to-br ${w.bg} p-8 text-white`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl">{w.emoji}</span>
                  <span className="bg-white/25 text-xs font-bold px-2 py-1 rounded-full">Grade {w.grade}</span>
                </div>
                <h2 className="text-2xl font-black mb-2">{w.title}</h2>
                <p className="text-white/85 text-sm mb-4">{w.desc}</p>
                <div className="font-bold text-sm">Play Now →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
