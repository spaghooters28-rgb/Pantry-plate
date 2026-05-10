import { Router, type IRouter } from "express";
import { eq, asc, and } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
} from "@workspace/api-zod";
import { requireAuth } from "../../middleware/requireAuth";
import { requireTier } from "../../middleware/requireTier";
import { createUserRateLimit } from "../../middleware/rateLimit";
import { checkAndIncrementAiUsage } from "../../lib/aiUsage";

const router: IRouter = Router();

const messageSendRateLimit = createUserRateLimit(30, 60 * 60 * 1000);

function getSystemPrompt(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Today is ${dateStr} at ${timeStr}.

You are a helpful meal planning assistant for the Pantry & Plate app.
You help users with:
- Suggesting meals and recipes based on their preferences, dietary restrictions, or what's in their pantry
- Creating and adjusting weekly meal plans (assigning meals to specific days)
- Adding meals to the user's favorites list
- Advising on grocery shopping and what ingredients to buy
- Answering cooking questions, substitutions, and techniques
- Suggesting side dishes and complementary foods
- Helping with meal prep and planning strategies

Be concise, friendly, and practical. When suggesting meals, include key details like cuisine type, protein, approximate cook time, and calories when relevant. Format lists clearly using bullet points or numbered steps.

IMPORTANT — ACTIONS:
When the user asks you to assign a meal to a specific day of the week, include an ACTION block in your response (in addition to your text reply):
[ACTION:{"type":"assign_meal","day":"<day>","mealName":"<exact meal name you mentioned>"}]

When the user asks you to add a meal to their favorites, include:
[ACTION:{"type":"toggle_favorite","mealName":"<exact meal name you mentioned>"}]

Available days: sunday, monday, tuesday, wednesday, thursday, friday, saturday
Use lowercase day names only. Use the exact meal name as you referred to it in the conversation. Include ACTION blocks at the very end of your response, after your normal text. Only emit ACTION blocks when the user explicitly requests an assignment or favorite action.`;
}

router.get("/openai/conversations", requireAuth, requireTier("pro_ai"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(asc(conversations.createdAt));
  res.json(rows);
});

router.post("/openai/conversations", requireAuth, requireTier("pro_ai"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [conv] = await db
    .insert(conversations)
    .values({ userId, title: parsed.data.title })
    .returning();
  res.status(201).json(conv);
});

router.get("/openai/conversations/:id", requireAuth, requireTier("pro_ai"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json({ ...conv, messages: msgs });
});

router.delete("/openai/conversations/:id", requireAuth, requireTier("pro_ai"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.status(204).end();
});

router.get("/openai/conversations/:id/messages", requireAuth, requireTier("pro_ai"), async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json(msgs);
});

router.post("/openai/conversations/:id/messages", requireAuth, requireTier("pro_ai"), messageSendRateLimit, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // Monthly AI usage cap — after body validation so malformed requests don't consume quota
  const usage = await checkAndIncrementAiUsage(userId);
  if (!usage.allowed) {
    res.status(429).json({
      error: `Monthly AI limit reached (${usage.cap} requests/month). Resets next month.`,
      used: usage.used,
      limit: usage.cap,
      cap: true,
    });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content: parsed.data.content,
  });

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: getSystemPrompt() },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: parsed.data.content },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let fullResponse = "";
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });
  } catch (err) {
    req.log.error({ err }, "OpenAI streaming error");
    res.write(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
