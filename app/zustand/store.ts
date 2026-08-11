import { Message } from "@/types/types";
import { number } from "zod";
import { create } from "zustand";

type MessageStore = {
  messages: Message[];
  addConversation: (message: Message) => void;
  clearMessages: () => void;
};

export const useGptStore = create<MessageStore>((set) => ({
  messages: [],
  addConversation: (message) => {
    if (!message || typeof message !== "object") {
      console.warn("Invalid message provided to addConversation");
      return;
    }
    console.log("I was called");
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => set({ messages: [] }),
}));

export const useGeminiStore = create<MessageStore>((set) => ({
  messages: [],

  addConversation: (message) => {
    if (!message || typeof message !== "object") {
      console.warn("Invalid message provided to addConversation");
      return;
    }
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => set({ messages: [] }),
}));

export const useMetaStore = create<MessageStore>((set) => ({
  messages: [],

  addConversation: (message) => {
    if (!message || typeof message !== "object") {
      console.warn("Invalid message provided to addConversation");
      return;
    }
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => set({ messages: [] }),
}));

export type Chat = {
  chatName: string;
  chatUUID: string;
};

type ChatHistoryStore = {
  chats: Chat[];

  addChat: (chat: Chat) => void;
  appendChat: (chats: Chat[]) => void;
  removeChat: (chatUUID: string) => void;
  updateChatName: (chatUUID: string, newName: string) => void;
  clearChat: () => void;
};

export const useChatHistoryStore = create<ChatHistoryStore>((set) => ({
  chats: [],

  addChat: (chat) => {
    if (!chat || typeof chat !== "object" || !chat.chatUUID) {
      console.warn("Invalid chat provided to addChat");
      return;
    }
    set((state) => ({
      chats: [chat, ...state.chats],
    }));
  },

  appendChat: (chats) => {
    set((state) => ({
      chats: [...state.chats, ...chats],
    }));
  },

  removeChat: (chatUUID) => {
    set((state) => ({
      chats: state.chats.filter((c) => c.chatUUID !== chatUUID),
    }));
  },

  updateChatName: (chatUUID, newName) => {
    set((state) => ({
      chats: state.chats.map((c) => c.chatUUID === chatUUID ? { ...c, chatName: newName } : c),
    }));
  },

  clearChat: () => set({ chats: [] }),
}));

export type OptionsMenu = {
  x: number;
  y: number;
  visibility: boolean;
  componentID: string;
}

type OptionsMenuStore = {
  options: OptionsMenu;
  setOptions: (options: OptionsMenu) => void;
}

export const useOptionsMenuStore = create<OptionsMenuStore>((set) => ({
  options: { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER, componentID: "", visibility: false },
  setOptions: (options: OptionsMenu) => {
    set((state) => ({
      options
    }))
  }
}))