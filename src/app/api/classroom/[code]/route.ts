import { NextRequest } from "next/server";
import { rooms, getRoomSnapshot } from "@/lib/classroomStore";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { code } = await ctx.params;
  const room = rooms.get(code.toUpperCase());
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  return Response.json(getRoomSnapshot(room));
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { code } = await ctx.params;
  const room = rooms.get(code.toUpperCase());
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });

  let body: { action: string; playerId?: string; questionIndex?: number; value?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const { action, playerId } = body;
  const player = playerId ? room.players.get(playerId) : undefined;

  if (action === "ping") {
    if (player) player.lastSeen = Date.now();
    return Response.json(getRoomSnapshot(room));
  }

  if (action === "start") {
    if (!player?.isTeacher) return Response.json({ error: "Not authorized" }, { status: 403 });
    if (room.phase !== "waiting") return Response.json({ error: "Game already started" }, { status: 409 });
    room.phase = "playing";
    room.startedAt = Date.now();
    return Response.json(getRoomSnapshot(room));
  }

  if (action === "end") {
    if (!player?.isTeacher) return Response.json({ error: "Not authorized" }, { status: 403 });
    room.phase = "ended";
    room.endedAt = Date.now();
    return Response.json(getRoomSnapshot(room));
  }

  if (action === "answer") {
    if (!player) return Response.json({ error: "Player not found" }, { status: 404 });
    if (room.phase !== "playing") return Response.json({ error: "Game not active" }, { status: 409 });

    const { questionIndex, value } = body as { action: string; playerId: string; questionIndex: number; value: number };
    const problem = room.problems[questionIndex];
    if (!problem) return Response.json({ error: "Invalid question" }, { status: 400 });
    if (player.currentQuestion !== questionIndex) return Response.json({ error: "Out of order" }, { status: 409 });

    const correct = value === problem.answer;
    if (correct) player.score++;
    player.currentQuestion++;
    player.lastSeen = Date.now();

    if (player.currentQuestion >= room.problems.length) {
      player.finished = true;
      // Auto-end when all non-teacher players finish
      const active = Array.from(room.players.values()).filter((p) => !p.isTeacher);
      if (active.length > 0 && active.every((p) => p.finished)) {
        room.phase = "ended";
        room.endedAt = Date.now();
      }
    }

    return Response.json({ correct, score: player.score, snapshot: getRoomSnapshot(room) });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
