import type { Metadata } from "next";
import PracticeClient from "@/components/game/PracticeClient";

export const metadata: Metadata = {
  title: "Addition Games for Kids - 2 Digit Addition Practice | KidsMathSkills",
  description: "Fun addition games for kids! Practice single digit, 2-digit, and 3-digit addition. Free online math games with rewards and adaptive difficulty.",
  keywords: "2 digit addition worksheets, addition games for kids, addition practice, first grade math, second grade addition",
};

export default function AdditionPage() {
  return (
    <PracticeClient
      type="addition"
      title="Addition"
      emoji="➕"
      color="bg-gradient-to-br from-blue-500 to-cyan-500"
      description="From simple sums to 3-digit addition. Great for K–3rd grade!"
      seoContent={{
        h2: "2-Digit Addition Practice",
        body: "Practice addition from simple single-digit sums to challenging 3-digit problems. Our adaptive system starts easy and gets harder as you improve — keeping kids in the perfect learning zone.",
      }}
    />
  );
}
