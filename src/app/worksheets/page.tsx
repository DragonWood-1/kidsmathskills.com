import type { Metadata } from "next";
import WorksheetsClient from "./WorksheetsClient";

export const metadata: Metadata = {
  title: "Free Math Worksheets for Kids - Printable PDF | KidsMathSkills",
  description: "Free printable math worksheets for K-6! Addition, subtraction, multiplication, fractions, counting money, word problems, and more. Download PDF worksheets instantly.",
  keywords: "free math worksheets, printable math worksheets, 2 digit addition worksheets, counting money worksheets, multiplication worksheets, fractions worksheets",
};

export default function WorksheetsPage() {
  return <WorksheetsClient />;
}
