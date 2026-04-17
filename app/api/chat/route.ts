import Groq from "groq-sdk";

export const runtime = "nodejs";

type ChatRequest = {
  message: string;
  sessionId?: string;
  page?: string;
};

function badRequest(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return badRequest("Server missing GROQ_API_KEY", 500);

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const userMessage = (body.message ?? "").trim();
  if (!userMessage) return badRequest("Message is required");
  if (userMessage.length > 2000) return badRequest("Message too long");

  // Groq model names change; keep a safe default that exists.
  const primaryModel = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const fallbackModel = "llama-3.1-8b-instant";
  const systemPrompt =
    process.env.GROQ_SYSTEM_PROMPT ??
    "You are the Klyperix production assistant. Be concise, premium, and helpful. Ask 1-2 clarifying questions when needed. If the user asks for a human/owner, instruct them to create an official ticket.";

  const groq = new Groq({ apiKey });

  async function run(model: string) {
    return await groq.chat.completions.create({
      model,
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
  }

  let completion;
  let usedModel = primaryModel;
  try {
    completion = await run(primaryModel);
  } catch (e: unknown) {
    const err = e as {
      message?: string;
      code?: string;
      error?: { error?: { message?: string; code?: string } };
    };
    const msg =
      err?.error?.error?.message || err?.message || "Groq request failed";
    const code = err?.error?.error?.code || err?.code;
    // If a configured model is deprecated/decommissioned, fall back automatically.
    if (
      primaryModel !== fallbackModel &&
      (code === "model_decommissioned" || code === "model_not_found")
    ) {
      usedModel = fallbackModel;
      completion = await run(fallbackModel);
    } else {
      return badRequest(msg, 502);
    }
  }

  const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return badRequest("Empty model response", 502);

  return Response.json({
    ok: true,
    reply: text,
    model: usedModel,
  });
}

