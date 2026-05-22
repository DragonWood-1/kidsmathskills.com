import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "KidsMathSkills - Fun Math Games & Learning for Kids",
  description: "Adventure-based math learning for kids K-6. Math worlds, games, rewards, worksheets, and parent dashboards. Make math fun!",
  keywords: "multiplication games, fractions for kids, 3rd grade math practice, math facts fluency, math games for kids",
  openGraph: {
    title: "KidsMathSkills - Fun Math Games & Learning for Kids",
    description: "Adventure-based math learning for kids K-6.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
