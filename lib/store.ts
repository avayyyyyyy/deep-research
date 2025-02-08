import { create } from "zustand";

export type MessageType = {
  id: string;
  content: string;
  type: "user" | "assistant";
  followUpQuestions?: string[];
  currentQuestionIndex?: number;
};

interface ChatStore {
  messages: MessageType[];
  hasMessages: boolean;
  isChatPending: boolean;
  addMessage: (message: MessageType) => void;
  clearMessages: () => void;
  setIsChatPending: (isPending: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: "1",
      content:
        "Hi! I'm looking for information about the latest developments in renewable energy technology. Can you help me with that?",
      type: "user",
    },
    {
      id: "2",
      content:
        "I'd be happy to help you learn about recent developments in renewable energy technology. What specific aspects are you most interested in - solar, wind, hydroelectric, or perhaps emerging technologies like hydrogen fuel cells?",
      type: "assistant",
    },
    {
      id: "3",
      content:
        "I'm particularly interested in solar energy advancements. What are some of the most significant breakthroughs in solar panel efficiency and storage solutions?",
      type: "user",
    },
    {
      id: "4",
      content:
        "There have been several exciting breakthroughs in solar technology recently. Some key developments include perovskite solar cells achieving over 29% efficiency, new bifacial solar panels that can capture light from both sides, and advanced energy storage systems using solid-state batteries. Would you like me to elaborate on any of these topics?",
      type: "assistant",
    },
    {
      id: "5",
      content:
        "Yes, please tell me more about perovskite solar cells! How do they compare to traditional silicon-based panels?",
      type: "user",
    },
    {
      id: "6",
      content:
        "Perovskite solar cells are really fascinating! Compared to traditional silicon panels, they're cheaper to produce, more flexible in application, and can be manufactured at lower temperatures. While traditional silicon panels typically max out at 22% efficiency, perovskite cells have reached 29.3% in lab conditions. The main challenge now is improving their long-term stability and durability for commercial use.",
      type: "assistant",
    },
    {
      id: "7",
      content: `Sure, here's a summary of today's tech news:
### Technology
 
Latest developments in Technology:
* OpenAI announces new breakthrough in language models
* Tech giants collaborate on AI safety standards
* Quantum computing reaches new milestone
`,
      type: "user",
    },
  ],
  hasMessages: true,
  isChatPending: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      hasMessages: true,
    })),
  clearMessages: () => set({ messages: [], hasMessages: false }),
  setIsChatPending: (isPending) => set({ isChatPending: isPending }),
}));
