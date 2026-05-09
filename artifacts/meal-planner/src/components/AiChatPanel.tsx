import { useState, useRef, useEffect, useCallback } from "react";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useAiChat } from "@/contexts/AiChatContext";

export type ChatAction = {
  type: "assign_meal" | "toggle_favorite";
  day?: string;
  mealName: string;
};

const STARTER_PROMPTS = [
  "What should I cook this week?",
  "Suggest some gluten-free dinner ideas",
  "Add Chicken Tikka Masala to Wednesday",
  "What are some quick 30-minute meals?",
];

function parseActions(text: string): { cleanText: string; actions: ChatAction[] } {
  const actions: ChatAction[] = [];
  const cleanText = text
    .replace(/\[ACTION:(.+?)\]/g, (_, json) => {
      try {
        const parsed = JSON.parse(json) as ChatAction;
        if (parsed.type && parsed.mealName) actions.push(parsed);
      } catch {
        // ignore malformed
      }
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { cleanText, actions };
}

export function AiChatPanel({ onAction }: { onAction?: (actions: ChatAction[]) => Promise<void> }) {
  const { messages, setMessages, conversationId, setConversationId, isOpen, setIsOpen } = useAiChat();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const createConversation = useCreateOpenaiConversation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  async function ensureConversation(): Promise<number> {
    if (conversationId) return conversationId;
    const conv = await createConversation.mutateAsync({
      data: { title: "Meal Discovery Assistant" },
    });
    const id = (conv as { id: number }).id;
    setConversationId(id);
    queryClient.invalidateQueries({ queryKey: ["listOpenaiConversations"] });
    return id;
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    try {
      const id = await ensureConversation();
      abortRef.current = new AbortController();

      const response = await fetch(`/api/openai/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI assistant");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              fullContent += parsed.content;
              const { cleanText } = parseActions(fullContent);
              setMessages((prev) => {
                const next = [...prev];
                const msg = next[next.length - 1];
                if (msg?.role === "assistant") {
                  next[next.length - 1] = { ...msg, content: cleanText || fullContent };
                }
                return next;
              });
            }
            if (parsed.done || parsed.error) break;
          } catch {
            // ignore malformed chunks
          }
        }
      }

      const { cleanText, actions } = parseActions(fullContent);

      setMessages((prev) => {
        const next = [...prev];
        const msg = next[next.length - 1];
        if (msg?.role === "assistant") {
          next[next.length - 1] = { ...msg, content: cleanText || fullContent, streaming: false };
        }
        return next;
      });

      if (actions.length > 0 && onAction) {
        await onAction(actions);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const withoutPartial = prev[prev.length - 1]?.streaming
            ? prev.slice(0, -1)
            : prev;
          return [...withoutPartial, { role: "assistant", content: "Sorry, I ran into an issue. Please try again." }];
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleReset() {
    if (isStreaming) abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }

  const userMsgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">AI Meal Assistant</p>
            <p className="text-xs text-muted-foreground">
              {userMsgCount > 0
                ? `${userMsgCount} message${userMsgCount !== 1 ? "s" : ""} — tap to continue`
                : "Ask for ideas or say 'Add pasta to Tuesday'"}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <div className="h-80 overflow-y-auto px-4 py-3 space-y-3 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Your Meal Planning Assistant</p>
                  <p className="text-xs text-muted-foreground max-w-64">
                    Ask for meal ideas, add favorites, or assign meals to days of your week.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-current opacity-70 animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-4 py-3 flex gap-2 items-end bg-background/50">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
                title="Start new conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about meals, or say 'Add pasta to Tuesday'…"
              className="resize-none min-h-9 max-h-32 text-sm py-2 flex-1"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
