import type { Metadata } from "next";
import PracticeClient from "@/components/game/PracticeClient";

export const metadata: Metadata = {
  title: "Multiplication Games Online - Free Times Tables Practice | KidsMathSkills",
  description: "Free online multiplication games for kids! Practice times tables 1-12, speed drills, and earn rewards. Perfect for 3rd-5th grade math facts fluency.",
  keywords: "multiplication games online, times tables games, multiplication facts, times tables practice, 3rd grade multiplication",
};

export default function MultiplicationPage() {
  return (
    <PracticeClient
      type="multiplication"
      title="Multiplication"
      emoji="✖️"
      color="bg-gradient-to-br from-purple-500 to-indigo-600"
      description="Master your times tables! Great for 3rd–5th grade."
      seoContent={{
        h2: "Multiplication Games Online",
        body: "Our interactive multiplication games help kids master times tables from 1×1 to 12×12. With adaptive difficulty and instant rewards, kids build multiplication fluency fast. Perfect for 3rd grade, 4th grade, and 5th grade students.",
      }}
    />
  );
}
