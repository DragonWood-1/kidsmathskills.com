import type { Metadata } from "next";
import DrawMathClient from "./DrawMathClient";

export const metadata: Metadata = {
  title: "DrawMath – Visual Math Drawing Tool for Kids | KidsMathSkills",
  description:
    "Draw fractions, shapes, and number lines! DrawMath is a free visual math canvas for kids K–6. Perfect for learning geometry, fractions, and more.",
  keywords: [
    "visual math for kids",
    "draw fractions",
    "math drawing tool",
    "geometry for kids",
    "fraction visualizer",
    "number line tool",
    "math canvas kids",
  ],
  openGraph: {
    title: "DrawMath – Draw Your Way to Math Mastery",
    description: "A free visual canvas where kids draw fractions, shapes, and number lines.",
  },
};

export default function DrawMathPage() {
  return <DrawMathClient />;
}
