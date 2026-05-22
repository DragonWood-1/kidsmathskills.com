import type { Metadata } from "next";
import PracticeClient from "@/components/game/PracticeClient";

export const metadata: Metadata = {
  title: "Fractions for Kids - Interactive Fraction Games | KidsMathSkills",
  description: "Learn fractions for kids with interactive games! Visual fraction practice, comparing fractions, adding fractions. Perfect for 3rd and 4th grade math.",
  keywords: "fractions for kids, fractions for 4th graders, fraction games, comparing fractions, adding fractions",
};

export default function FractionsPage() {
  return (
    <PracticeClient
      type="fractions"
      title="Fractions"
      emoji="½"
      color="bg-gradient-to-br from-pink-500 to-rose-600"
      description="Visual fraction learning for 3rd–5th grade. Compare, add, and understand fractions!"
      seoContent={{
        h2: "Fractions for Kids",
        body: "Learning fractions doesn't have to be hard! Our visual fraction games help kids understand halves, thirds, quarters, and more. We cover comparing fractions, equivalent fractions, and adding fractions with like denominators.",
      }}
    />
  );
}
