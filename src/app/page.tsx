import type { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import WorldsGrid from "@/components/home/WorldsGrid";
import FeaturesSection from "@/components/home/FeaturesSection";
import PracticeTopics from "@/components/home/PracticeTopics";
import HowItWorks from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "KidsMathSkills - Fun Math Games for Kids | Adventure-Based Learning",
  description: "The #1 adventure-based math platform for kids K-6. Math worlds, interactive games, rewards, and worksheets. Free multiplication games, fractions practice, and more!",
  keywords: "multiplication games for kids, fractions for kids, 3rd grade math practice, math facts fluency, counting money worksheets, 2 digit addition",
};

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white">
      <HeroSection />
      <WorldsGrid />
      <HowItWorks />
      <FeaturesSection />
      <PracticeTopics />
      {/* SEO Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">Everything Kids Need to Master Math</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-sm leading-relaxed">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">🎮 Multiplication Games Online</h3>
            <p>Our interactive multiplication games make times tables fun! Kids race through space missions, battle math bosses, and earn rewards as they master multiplication facts from 1×1 to 12×12.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">½ Fractions for Kids</h3>
            <p>Visual fraction learning that clicks! Kids see fractions come to life through pizza slices, animal feeding, and kingdom building. Perfect for 3rd and 4th grade fraction concepts.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">📝 Free Math Worksheets</h3>
            <p>Printable worksheets for every grade and topic — 2-digit addition, counting money, multiplication tables, word problems, and more. Teacher and parent approved!</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">📊 Parent & Teacher Dashboard</h3>
            <p>Track your child's progress in real-time. See which topics need more practice, celebrate achievements, and set daily math goals. Perfect for classroom and home use.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
