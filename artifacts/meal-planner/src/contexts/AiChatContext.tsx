import { createContext, useContext, useState, type ReactNode } from "react";

export type ChatAction = {
  type: "assign_meal" | "toggle_favorite";
  day?: string;
  mealName: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  pendingActions?: ChatAction[];
};

type AiChatContextValue = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  conversationId: number | null;
  setConversationId: React.Dispatch<React.SetStateAction<number | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AiChatContext.Provider value={{ messages, setMessages, conversationId, setConversationId, isOpen, setIsOpen }}>
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  const ctx = useContext(AiChatContext);
  if (!ctx) throw new Error("useAiChat must be used within AiChatProvider");
  return ctx;
}
