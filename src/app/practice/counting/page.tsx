import type { Metadata } from "next";
import PracticeClient from "@/components/game/PracticeClient";

export const metadata: Metadata = {
  title: "Counting Games for Kids - Number Patterns & Sequences | KidsMathSkills",
  description: "Fun counting games for kindergarten and 1st grade! Count by 1s, 2s, 5s, and 10s. Number patterns, sequences, and counting money activities.",
  keywords: "counting games for kids, counting money worksheets, number patterns, skip counting, kindergarten math",
};

export default function CountingPage() {
  return (
    <PracticeClient
      type="counting"
      title="Counting"
      emoji="🔢"
      color="bg-gradient-to-br from-green-500 to-teal-600"
      description="Count by 1s, 2s, 5s, and 10s. Perfect for Kindergarten–2nd grade!"
      seoContent={{
        h2: "Counting & Number Patterns",
        body: "Build a strong math foundation with counting practice! Kids learn to count by 1s, 2s, 5s, and 10s, recognize number patterns, and predict what comes next in a sequence. Perfect for kindergarten and 1st grade.",
      }}
    />
  );
}
