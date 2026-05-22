import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
            <span>🧮</span> KidsMathSkills
          </h3>
          <p className="text-sm leading-relaxed">
            Adventure-based math learning for kids K–6. Making math fun, one quest at a time!
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Math Worlds</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/worlds/number-quest" className="hover:text-yellow-400 transition-colors">🗺️ Number Quest</Link></li>
            <li><Link href="/worlds/math-zoo" className="hover:text-yellow-400 transition-colors">🦁 Math Zoo</Link></li>
            <li><Link href="/worlds/rocket-math" className="hover:text-yellow-400 transition-colors">🚀 Rocket Math</Link></li>
            <li><Link href="/worlds/math-kingdom" className="hover:text-yellow-400 transition-colors">🏰 Math Kingdom</Link></li>
            <li><Link href="/worlds/treasure-math" className="hover:text-yellow-400 transition-colors">🏴‍☠️ Treasure Math</Link></li>
            <li><Link href="/tiny-tables" className="hover:text-yellow-400 transition-colors">⚡ TinyTables</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Practice</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/practice/addition" className="hover:text-yellow-400 transition-colors">➕ Addition</Link></li>
            <li><Link href="/practice/multiplication" className="hover:text-yellow-400 transition-colors">✖️ Multiplication</Link></li>
            <li><Link href="/practice/fractions" className="hover:text-yellow-400 transition-colors">½ Fractions</Link></li>
            <li><Link href="/practice/counting" className="hover:text-yellow-400 transition-colors">🔢 Counting</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">Popular Topics</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/worksheets" className="hover:text-yellow-400 transition-colors">📄 Free Worksheets</Link></li>
            <li><Link href="/dashboard" className="hover:text-yellow-400 transition-colors">📊 Parent Dashboard</Link></li>
            <li><Link href="/mathbuddy" className="hover:text-yellow-400 transition-colors">🤖 MathBuddy AI Tutor</Link></li>
            <li><Link href="/drawmath" className="hover:text-yellow-400 transition-colors">🎨 DrawMath Canvas</Link></li>
            <li><Link href="/practice/multiplication" className="hover:text-yellow-400 transition-colors">Multiplication Games</Link></li>
            <li><Link href="/practice/fractions" className="hover:text-yellow-400 transition-colors">Fractions for Kids</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-sm">
        <p>© 2025 KidsMathSkills.com · Making Math Adventures Since 2025</p>
      </div>
    </footer>
  );
}
