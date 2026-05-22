import type { Metadata } from "next";
import MathKingdomClient from "./MathKingdomClient";

export const metadata: Metadata = {
  title: "Math Kingdom - Build Your Castle | KidsMathSkills",
  description: "Build your own castle kingdom by solving math problems! Earn bricks, resources, and upgrade your village. Math strategy game for kids.",
};

export default function MathKingdomPage() {
  return <MathKingdomClient />;
}
