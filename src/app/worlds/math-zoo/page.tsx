import type { Metadata } from "next";
import MathZooClient from "./MathZooClient";

export const metadata: Metadata = {
  title: "Math Zoo - Feed Magical Animals | KidsMathSkills",
  description: "Feed and evolve magical animals with correct math answers! Learn counting, fractions, multiplication, and more in this collectible pet game.",
};

export default function MathZooPage() {
  return <MathZooClient />;
}
