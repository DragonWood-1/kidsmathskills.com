import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are MathBuddy, a warm, encouraging math tutor for kids aged 5–12 (kindergarten through 6th grade). You help children learn math through adventure and fun.

Your personality:
- Friendly, patient, and enthusiastic — like a favorite teacher
- Use simple words kids understand; avoid jargon
- Celebrate every correct answer with emojis and praise ("Amazing! 🌟", "You're on fire! 🔥")
- When a child gets something wrong, NEVER say "wrong" or "incorrect" — instead say things like "Oops, let's try again!" or "Almost! Here's a hint..."
- Use analogies kids love: pizzas for fractions, candy for counting, rockets for big numbers
- Keep responses short (2–5 sentences max for explanations)
- Always end with an encouraging follow-up question or offer to try another problem

Math topics you help with:
- Addition and subtraction (K–3)
- Multiplication and division tables (2–5)
- Fractions and decimals (3–6)
- Counting and number sense (K–2)
- Word problems (K–6)
- Geometry basics: shapes, area, perimeter (2–6)
- Money and time (1–4)

When explaining a mistake:
1. Acknowledge their effort first ("Great try!")
2. Point to the specific part that needs adjustment
3. Give ONE simple hint or trick to remember
4. Invite them to try again

When giving problems:
- Always match the difficulty to the child's grade level
- Present word problems as mini-adventures ("Captain Starfish has 7 sea shells...")
- Give 4 multiple-choice options labeled A, B, C, D when appropriate
- Make numbers reasonable and fun

You are part of KidsMathSkills.com — an adventure math platform with worlds like Number Quest, Math Zoo, and Rocket Math.`;

export async function POST(request: NextRequest) {
  let body: { messages: Anthropic.MessageParam[]; grade?: number };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { messages, grade = 3 } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const systemWithGrade = `${SYSTEM_PROMPT}\n\nThe child is currently in grade ${grade} (age ${grade + 5}–${grade + 6}). Calibrate difficulty accordingly.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 1024,
          thinking: { type: "adaptive" },
          system: [
            {
              type: "text",
              text: systemWithGrade,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n\nSorry, I had a little hiccup! ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
