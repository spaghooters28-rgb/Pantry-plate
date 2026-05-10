import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2, RotateCcw, X, Sparkles, Check, Ban } from "lucide-react";
import { useAiChat, type ChatAction, type ChatMessage } from "@/contexts/AiChatContext";

export type { ChatAction } from "@/contexts/AiChatContext";

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

function actionLabel(action: ChatAction): string {
  if (action.type === "assign_meal" && action.day) {
    const day = action.day.charAt(0).toUpperCase() + action.day.slice(1);
    return `Assign "${action.mealName}" to ${day}`;
  }
  if (action.type === "toggle_favorite") {
    return `Toggle favorite for "${action.mealName}"`;
  }
  return `Action: ${action.type}`;
}

export function AiChatPanel({ onAction }: { onAction?: (actions: ChatAction[]) => Promise<void> }) {
  const { messages, setMessages, conversationId, setConversationId, isOpen, setIsOpen } = useAiChat();
  const typedMessages = messages as ChatMessage[];
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const createConversation = useCreateOpenaiConversation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [messages, isOpen, scrollToBottom]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

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
                const msg = next[next.length - 1] as ChatMessage;
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

      // Attach parsed actions as pendingActions requiring explicit user confirmation.
      // Actions are NOT executed automatically — the user must click "Apply" below.
      setMessages((prev) => {
        const next = [...prev];
        const msg = next[next.length - 1] as ChatMessage;
        if (msg?.role === "assistant") {
          next[next.length - 1] = {
            ...msg,
            content: cleanText || fullContent,
            streaming: false,
            pendingActions: actions.length > 0 ? actions : undefined,
          };
        }
        return next;
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const msgs = prev as ChatMessage[];
          const withoutPartial = msgs[msgs.length - 1]?.streaming
            ? msgs.slice(0, -1)
            : msgs;
          return [...withoutPartial, { role: "assistant", content: "Sorry, I ran into an issue. Please try again." }];
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  async function handleApplyActions(idx: number, actions: ChatAction[]) {
    if (!onAction || applyingIdx !== null) return;
    setApplyingIdx(idx);
    try {
      await onAction(actions);
    } finally {
      // Clear the pending actions from that message regardless of outcome
      setMessages((prev) => {
        const next = [...prev] as ChatMessage[];
        if (next[idx]) {
          next[idx] = { ...next[idx], pendingActions: undefined };
        }
        return next;
      });
      setApplyingIdx(null);
    }
  }

  function handleDismissActions(idx: number) {
    setMessages((prev) => {
      const next = [...prev] as ChatMessage[];
      if (next[idx]) {
        next[idx] = { ...next[idx], pendingActions: undefined };
      }
      return next;
    });
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

  const userMsgCount = typedMessages.filter((m) => m.role === "user").length;

  return (
    <>
      {/* Collapsed trigger bar */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors shadow-sm"
        onClick={() => setIsOpen(true)}
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
        <Sparkles className="w-4 h-4 text-primary/60" />
      </button>

      {/* Full-screen overlay rendered via portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">AI Meal Assistant</p>
              <p className="text-xs text-muted-foreground">
                Ask for ideas, assign meals to days, or manage favorites
              </p>
            </div>
            <div className="flex items-center gap-2">
              {typedMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={handleReset}
                  title="Start new conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {typedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 pb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Your Meal Planning Assistant</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Ask for meal ideas, add favorites, or assign meals to specific days of your week.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              typedMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 mr-2">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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

                  {/* Pending action confirmation — only shown after streaming ends */}
                  {!msg.streaming && msg.pendingActions && msg.pendingActions.length > 0 && onAction && (
                    <div className="mt-2 ml-9 w-full max-w-[80%] rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 space-y-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Suggested {msg.pendingActions.length === 1 ? "action" : "actions"} — confirm to apply
                      </p>
                      <ul className="space-y-1">
                        {msg.pendingActions.map((action, ai) => (
                          <li key={ai} className="text-sm text-foreground">
                            • {actionLabel(action)}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleApplyActions(i, msg.pendingActions!)}
                          disabled={applyingIdx !== null}
                        >
                          {applyingIdx === i ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDismissActions(i)}
                          disabled={applyingIdx !== null}
                        >
                          <Ban className="w-3 h-3" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-4 py-3 flex gap-2 items-end bg-card shrink-0">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about meals, or say 'Add pasta to Tuesday'…"
              className="resize-none min-h-10 max-h-40 text-sm py-2.5 flex-1"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              size="icon"
              className="shrink-0 h-10 w-10"
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
        </div>,
        document.body
      )}
    </>
  );
}
