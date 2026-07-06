"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Tool = "pencil" | "line" | "rect" | "circle" | "eraser" | "fill" | "text";
type Mode = "free" | "fractions" | "numberline" | "geometry";

interface Point { x: number; y: number }

const COLORS = [
  "#1e1e1e", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#94a3b8",
];

const SIZES = [2, 4, 8, 14];

const TOOLS: { id: Tool; emoji: string; label: string }[] = [
  { id: "pencil", emoji: "✏️", label: "Pencil" },
  { id: "line", emoji: "📏", label: "Line" },
  { id: "rect", emoji: "⬜", label: "Rectangle" },
  { id: "circle", emoji: "⭕", label: "Circle" },
  { id: "eraser", emoji: "🧹", label: "Eraser" },
  { id: "text", emoji: "🔤", label: "Text" },
];

const MODES: { id: Mode; emoji: string; label: string; desc: string }[] = [
  { id: "free", emoji: "🎨", label: "Free Draw", desc: "Draw anything!" },
  { id: "fractions", emoji: "½", label: "Fractions", desc: "Visualize fractions" },
  { id: "numberline", emoji: "📐", label: "Number Line", desc: "Place numbers on a line" },
  { id: "geometry", emoji: "📐", label: "Geometry", desc: "Shapes & angles" },
];

function getFractionSvg(numerator: number, denominator: number, shape: "circle" | "bar"): string {
  if (shape === "bar") {
    const w = 300; const h = 60; const filled = Math.round((numerator / denominator) * w);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect x="0" y="5" width="${w}" height="${h - 10}" fill="#e5e7eb" rx="8"/>
      <rect x="0" y="5" width="${filled}" height="${h - 10}" fill="#6366f1" rx="8"/>
      ${Array.from({ length: denominator - 1 }, (_, i) => {
        const x = Math.round(((i + 1) / denominator) * w);
        return `<line x1="${x}" y1="5" x2="${x}" y2="${h - 5}" stroke="white" stroke-width="2"/>`;
      }).join("")}
      <text x="${w / 2}" y="${h / 2 + 5}" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${numerator}/${denominator}</text>
    </svg>`;
  }
  // circle / pie
  const cx = 75; const cy = 75; const r = 65;
  const slices = Array.from({ length: denominator }, (_, i) => {
    const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const fill = i < numerator ? "#6366f1" : "#e5e7eb";
    return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${fill}" stroke="white" stroke-width="2"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">${slices.join("")}<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${numerator}/${denominator}</text></svg>`;
}

export default function DrawMathClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(4);
  const [mode, setMode] = useState<Mode>("free");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);
  // fraction helper state
  const [fracNumer, setFracNumer] = useState(1);
  const [fracDenom, setFracDenom] = useState(4);
  const [fracShape, setFracShape] = useState<"circle" | "bar">("circle");
  // number line state
  const [nlMin, setNlMin] = useState(0);
  const [nlMax, setNlMax] = useState(10);
  // geometry helper
  const [geoShape, setGeoShape] = useState<"triangle" | "square" | "pentagon" | "hexagon">("triangle");
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const getCanvas = () => canvasRef.current!;
  const getCtx = () => getCanvas().getContext("2d")!;
  const getOverlay = () => overlayRef.current!;
  const getOverlayCtx = () => getOverlay().getContext("2d")!;

  // Save state for undo
  const saveHistory = useCallback(() => {
    const ctx = getCtx();
    const data = ctx.getImageData(0, 0, getCanvas().width, getCanvas().height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(data);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = getCanvas();
    const overlay = getOverlay();
    const resize = () => {
      const container = canvas.parentElement!;
      const w = container.clientWidth;
      const h = Math.max(400, container.clientHeight);
      // save existing drawing
      const ctx = canvas.getContext("2d")!;
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = w; canvas.height = h;
      overlay.width = w; overlay.height = h;
      ctx.putImageData(img, 0, 0);
      ctx.fillStyle = "#ffffff";
    };
    resize();
    // White background
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [saveHistory]);

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = getCanvas();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function drawShape(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (tool === "line") {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    } else if (tool === "rect") {
      ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (tool === "circle") {
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const cx = from.x + (to.x - from.x) / 2;
      const cy = from.y + (to.y - from.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
  }

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (tool === "text") {
      setTextPos(getPos(e));
      return;
    }
    setIsDrawing(true);
    const pos = getPos(e);
    setStartPoint(pos);
    if (tool === "pencil" || tool === "eraser") {
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (tool === "pencil" || tool === "eraser") {
      const ctx = getCtx();
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "eraser" ? size * 4 : size;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // preview on overlay
      const oc = getOverlayCtx();
      oc.clearRect(0, 0, getOverlay().width, getOverlay().height);
      drawShape(oc, startPoint, pos);
    }
  }

  function onPointerUp(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getPos(e);
    if (tool !== "pencil" && tool !== "eraser") {
      const ctx = getCtx();
      ctx.globalCompositeOperation = "source-over";
      drawShape(ctx, startPoint, pos);
      getOverlayCtx().clearRect(0, 0, getOverlay().width, getOverlay().height);
    }
    getCtx().globalCompositeOperation = "source-over";
    saveHistory();
  }

  function commitText() {
    if (!textPos || !textInput.trim()) { setTextPos(null); setTextInput(""); return; }
    const ctx = getCtx();
    ctx.font = `bold ${size * 6 + 12}px sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);
    saveHistory();
    setTextPos(null);
    setTextInput("");
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const ctx = getCtx();
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  }

  function clearCanvas() {
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, getCanvas().width, getCanvas().height);
    saveHistory();
  }

  function downloadCanvas() {
    const link = document.createElement("a");
    link.download = "drawmath.png";
    link.href = getCanvas().toDataURL();
    link.click();
  }

  function stampFraction() {
    const svg = getFractionSvg(fracNumer, fracDenom, fracShape);
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const ctx = getCtx();
      const canvas = getCanvas();
      ctx.drawImage(img, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
      URL.revokeObjectURL(url);
      saveHistory();
    };
    img.src = url;
  }

  function drawNumberLine() {
    const ctx = getCtx();
    const canvas = getCanvas();
    const y = canvas.height / 2;
    const margin = 60;
    const w = canvas.width - margin * 2;
    const range = nlMax - nlMin;
    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    // arrow heads
    ctx.moveTo(canvas.width - margin - 10, y - 6);
    ctx.lineTo(canvas.width - margin, y);
    ctx.lineTo(canvas.width - margin - 10, y + 6);
    ctx.stroke();
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#1e1e1e";
    ctx.textAlign = "center";
    for (let i = nlMin; i <= nlMax; i++) {
      const x = margin + ((i - nlMin) / range) * w;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.stroke();
      ctx.fillText(String(i), x, y + 26);
    }
    saveHistory();
  }

  function drawGeoShape() {
    const sides = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 }[geoShape];
    const ctx = getCtx();
    const canvas = getCanvas();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(canvas.width, canvas.height) / 3;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    saveHistory();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white text-sm font-semibold">← Home</Link>
            <div className="w-px h-5 bg-white/30" />
            <span className="text-2xl">🎨</span>
            <div>
              <h1 className="font-black text-xl leading-none">DrawMath</h1>
              <p className="text-violet-200 text-xs">Visual math canvas for kids</p>
            </div>
          </div>
          {/* Mode selector */}
          <div className="flex gap-1.5 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  mode === m.id ? "bg-white text-violet-700 shadow" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full gap-0 p-4">
        {/* Left toolbar */}
        <div className="lg:w-52 flex-shrink-0 flex flex-row lg:flex-col gap-3 mb-3 lg:mb-0 lg:mr-4 flex-wrap">
          {/* Tools */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex-1 min-w-0">
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Tools</p>
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  title={t.label}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-bold transition-all ${
                    tool === t.id
                      ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="hidden lg:block mt-0.5">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Colors</p>
            <div className="grid grid-cols-5 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-1 ring-violet-500 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c, border: c === "#ffffff" ? "1px solid #e5e7eb" : "none" }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Size</p>
            <div className="flex items-center gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex items-center justify-center rounded-full transition-all ${
                    size === s ? "ring-2 ring-violet-400 bg-violet-50" : "hover:bg-gray-50"
                  }`}
                  style={{ width: s * 3 + 16, height: s * 3 + 16 }}
                >
                  <div className="rounded-full bg-gray-700" style={{ width: s * 2, height: s * 2 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Actions</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              <button onClick={undo} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 rounded-xl px-3 py-2 transition-colors">
                ↩️ Undo
              </button>
              <button onClick={clearCanvas} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl px-3 py-2 transition-colors">
                🗑️ Clear
              </button>
              <button onClick={downloadCanvas} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-xl px-3 py-2 transition-colors">
                💾 Save
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl px-3 py-2 transition-colors">
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Main area: canvas + mode helper */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Mode-specific helpers */}
          {mode === "fractions" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-violet-100 p-4 flex flex-wrap items-center gap-4"
            >
              <span className="text-lg font-black text-violet-700">½ Fraction Stamper</span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Numerator</label>
                <input type="number" min={1} max={fracDenom} value={fracNumer}
                  onChange={(e) => setFracNumer(Math.min(Number(e.target.value), fracDenom))}
                  className="w-14 text-center border-2 border-violet-200 rounded-lg px-2 py-1 text-sm font-black focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Denominator</label>
                <input type="number" min={1} max={12} value={fracDenom}
                  onChange={(e) => setFracDenom(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-center border-2 border-violet-200 rounded-lg px-2 py-1 text-sm font-black focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex gap-2">
                {(["circle", "bar"] as const).map((s) => (
                  <button key={s} onClick={() => setFracShape(s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${fracShape === s ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"}`}>
                    {s === "circle" ? "🥧 Pie" : "▬ Bar"}
                  </button>
                ))}
              </div>
              <button onClick={stampFraction}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow">
                Stamp {fracNumer}/{fracDenom} →
              </button>
            </motion.div>
          )}

          {mode === "numberline" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4 flex flex-wrap items-center gap-4"
            >
              <span className="text-lg font-black text-indigo-700">📐 Number Line</span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">From</label>
                <input type="number" value={nlMin} onChange={(e) => setNlMin(Number(e.target.value))}
                  className="w-16 text-center border-2 border-indigo-200 rounded-lg px-2 py-1 text-sm font-black focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">To</label>
                <input type="number" value={nlMax} onChange={(e) => setNlMax(Number(e.target.value))}
                  className="w-16 text-center border-2 border-indigo-200 rounded-lg px-2 py-1 text-sm font-black focus:outline-none focus:border-indigo-500" />
              </div>
              <button onClick={drawNumberLine}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-black text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow">
                Draw Number Line →
              </button>
            </motion.div>
          )}

          {mode === "geometry" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 flex flex-wrap items-center gap-4"
            >
              <span className="text-lg font-black text-blue-700">📐 Shape Stamper</span>
              <div className="flex gap-2 flex-wrap">
                {(["triangle", "square", "pentagon", "hexagon"] as const).map((s) => (
                  <button key={s} onClick={() => setGeoShape(s)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-all ${geoShape === s ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={drawGeoShape}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-sm px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow">
                Stamp {geoShape} →
              </button>
            </motion.div>
          )}

          {/* Canvas stack */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white"
            style={{ minHeight: 420 }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: "none", cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair" }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={() => { if (isDrawing) { setIsDrawing(false); saveHistory(); } }}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />
            {/* Overlay canvas for shape preview */}
            <canvas
              ref={overlayRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {/* Text input overlay */}
            {textPos && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
                onClick={(e) => { if (e.target === e.currentTarget) commitText(); }}>
                <div className="bg-white rounded-2xl shadow-xl p-5 flex flex-col gap-3 w-[90vw] max-w-sm">
                  <p className="font-black text-gray-700">Type your math text:</p>
                  <input autoFocus value={textInput} onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitText()}
                    className="border-2 border-violet-300 rounded-xl px-4 py-2 text-lg font-bold focus:outline-none focus:border-violet-500"
                    placeholder="e.g. 2 + 3 = 5" />
                  <div className="flex gap-2">
                    <button onClick={commitText} className="flex-1 bg-violet-600 text-white font-black py-2 rounded-xl hover:bg-violet-700">Add</button>
                    <button onClick={() => { setTextPos(null); setTextInput(""); }} className="px-4 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            {tool === "text" ? "Click on the canvas to place text" : "Draw freely • Use helpers above for math shapes"}
          </p>
        </div>
      </div>
    </div>
  );
}
