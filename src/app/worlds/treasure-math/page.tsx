import type { Metadata } from "next";
import TreasureMathClient from "./TreasureMathClient";

export const metadata: Metadata = {
  title: "Treasure Math - Pirate Math Adventure | KidsMathSkills",
  description: "Arrr! Solve math clues to find hidden treasure! A pirate-themed math adventure for kids learning mental math and problem solving.",
};

export default function TreasureMathPage() {
  return <TreasureMathClient />;
}
