import { NextRequest } from "next/server";
import {
  rooms,
  generateCode,
  generateProblems,
  getRoomSnapshot,
  cleanupRooms,
} from "@/lib/classroomStore";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function POST(request: NextRequest) {
  cleanupRooms();

  let body: { action: string; name?: string; avatar?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const { action, name = "Player", avatar = "🦊", code: joinCode } = body;

  if (action === "create") {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode();

    const teacherId = uid();
    const problems = generateProblems(code);

    rooms.set(code, {
      code,
      teacherId,
      players: new Map([
        [
          teacherId,
          {
            id: teacherId,
            name: name.slice(0, 25),
            avatar,
            score: 0,
            currentQuestion: 0,
            finished: false,
            isTeacher: true,
            lastSeen: Date.now(),
          },
        ],
      ]),
      phase: "waiting",
      problems,
      createdAt: Date.now(),
    });

    return Response.json({ code, playerId: teacherId, snapshot: getRoomSnapshot(rooms.get(code)!) });
  }

  if (action === "join") {
    if (!joinCode) return Response.json({ error: "code required" }, { status: 400 });
    const room = rooms.get(joinCode.toUpperCase());
    if (!room) return Response.json({ error: "Room not found. Check the code and try again." }, { status: 404 });
    if (room.phase === "ended") return Response.json({ error: "This game has already ended." }, { status: 410 });

    const playerId = uid();
    room.players.set(playerId, {
      id: playerId,
      name: name.slice(0, 25),
      avatar,
      score: 0,
      currentQuestion: 0,
      finished: false,
      isTeacher: false,
      lastSeen: Date.now(),
    });

    return Response.json({ playerId, snapshot: getRoomSnapshot(room) });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
