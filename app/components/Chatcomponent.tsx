"use client";

import React, { useEffect, useState } from "react";
import {
  useGptStore,
  useGeminiStore,
  useMetaStore,
  useChatHistoryStore,
  Chat,
} from "../zustand/store";
import { v6 as uuidv6 } from "uuid";
import PromptBox from "./PromptBox";
import { useParams, usePathname, useRouter } from "next/navigation";
import { conversations } from "../reqHandlers/conversations.reqHandler";
import { ConversationEntry } from "@/types/types";
import { ChatPanel } from "./ChatPanel";

const Chatcomponent = () => {
  const url = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [chatComponent, setChatComponent] = useState<boolean>(false);
  const [conversation, setConversations] = useState<ConversationEntry[]>([]);
  const [currentChatID, setCurrentChatID] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  const [gptResponse, setGptResponse] = useState<string>("");
  const [newConversationGpt, setNewConversationGpt] = useState<boolean>(false);
  const messagesGpt = useGptStore((state) => state.messages);
  const addConversationGpt = useGptStore((state) => state.addConversation);
  const clearGpt = useGptStore((state) => state.clearMessages);

  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [newConversationGemini, setNewConversationGemini] = useState<boolean>(false);
  const messagesGemini = useGeminiStore((state) => state.messages);
  const addConversationGemini = useGeminiStore((state) => state.addConversation);
  const clearGemini = useGeminiStore((state) => state.clearMessages);

  const [metaResponse, setMetaResponse] = useState<string>("");
  const [newConversationMeta, setNewConversationMeta] = useState<boolean>(false);
  const messagesMeta = useMetaStore((state) => state.messages);
  const addConversationMeta = useMetaStore((state) => state.addConversation);
  const clearMeta = useMetaStore((state) => state.clearMessages);

  const { addChat } = useChatHistoryStore();

  useEffect(() => {
    setCurrentChatID(url.chatID as string);
  }, [url.chatID]);

  useEffect(() => {
    clearGpt();
    clearGemini();
    clearMeta();
    setConversations([]);

    if (!url.chatID || pathname.includes("newChat")) {
      setChatComponent(false);
      return;
    }

    setChatComponent(true);
    console.log("Checking for pending prompt...");

    const pendingPrompt = sessionStorage.getItem("pendingPrompt");
    if (pendingPrompt) {
      setCurrentPrompt(pendingPrompt);
      setPrompt("");

      sessionStorage.removeItem("pendingPrompt");

      const newConversationID = uuidv6();

      startStreaming(newConversationID, url.chatID as string, pendingPrompt);
    } else {
      const getConversations = async () => {
        try {
          const result = await conversations(1, url.chatID as string);
          if (result.success) {
            setConversations(result.data.data);
          } else {
            console.error("Failed to fetch chat history", result.error);
          }
        } catch (error) {
          console.error("Error fetching conversations:", error);
        }
      };

      getConversations();
    }
  }, [url.chatID, pathname, clearGpt, clearGemini, clearMeta]);

  useEffect(() => {
    if (conversation.length === 0) return;

    conversation.forEach((entry) => {
      addConversationGpt({
        prompt: entry.prompt,
        response: entry.gpt ?? "There was an error getting the response.",
      });
      addConversationGemini({
        prompt: entry.prompt,
        response: entry.gemini ?? "There was an error getting the response.",
      });
      addConversationMeta({
        prompt: entry.prompt,
        response: entry.meta ?? "There was an error getting the response.",
      });
    });

    return () => {
      clearGpt();
      clearGemini();
      clearMeta();
    };
  }, [conversation, addConversationGpt, addConversationGemini, addConversationMeta, clearGpt, clearGemini, clearMeta]);

  const streamModel = async (
    model: string,
    setResponse: React.Dispatch<React.SetStateAction<string>>,
    addToStore: (msg: { prompt: string; response: string }) => void,
    setNewConversation: React.Dispatch<React.SetStateAction<boolean>>,
    conversationID: string,
    chatID: string,
    promptText?: string
  ): Promise<void> => {
    const promptToUse = promptText || prompt;

    if (!promptToUse.trim()) return;

    const data = { prompt: promptToUse, userID: 1, conversationID, chatID };
    const finalPrompt = promptToUse;
    let finalResponse = "";

    if (!promptText) {
      setCurrentPrompt(promptToUse);
      setPrompt("");
    }

    setNewConversation(true);

    const controller = new AbortController();
    let timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const response = await fetch(`http://localhost:3000/api/aiModels/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.body) {
        console.error("Response body is null");
        addToStore({ prompt: finalPrompt, response: "there was an error getting response" });
        setNewConversation(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      timeoutId = setTimeout(() => controller.abort(), 60000);
      while (true) {
        const { done, value } = await reader.read();
        clearTimeout(timeoutId);

        if (done) {
          setNewConversation(false);
          addToStore({ prompt: finalPrompt, response: finalResponse });
          setResponse("");
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        finalResponse += chunk;
        setResponse(finalResponse);

        timeoutId = setTimeout(() => controller.abort(), 60000);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`Error streaming model ${model}:`, error);
      addToStore({ prompt: finalPrompt, response: "there was an error getting response" });
      setNewConversation(false);
      setResponse("");
    }
  };

  const handleOnClick = async (): Promise<void> => {
    if (!prompt.trim()) return;

    const newConversationID = uuidv6();
    let newChatID = currentChatID;

    if (pathname.includes("newChat")) {
      newChatID = uuidv6();

      const chat: Chat = { chatName: "New Chat", chatUUID: newChatID };

      addChat(chat);

      sessionStorage.setItem("pendingPrompt", prompt);

      router.push(`/chat/${newChatID}`);
      return;
    }

    startStreaming(newConversationID, newChatID);
  };

  const startStreaming = async (conversationID: string, chatID: string, promptText?: string) => {
    await Promise.allSettled([
      streamModel("chatgpt", setGptResponse, addConversationGpt, setNewConversationGpt, conversationID, chatID, promptText),
      streamModel("gemini", setGeminiResponse, addConversationGemini, setNewConversationGemini, conversationID, chatID, promptText),
      streamModel("meta", setMetaResponse, addConversationMeta, setNewConversationMeta, conversationID, chatID, promptText),
    ]);
  };

  return (
    <>
      {chatComponent ? (
        <>
          <ChatPanel
            title="CHATGPT"
            messages={messagesGpt}
            newConversation={newConversationGpt}
            currentPrompt={currentPrompt}
            liveResponse={gptResponse}
          />
          <ChatPanel
            title="GEMINI"
            messages={messagesGemini}
            newConversation={newConversationGemini}
            currentPrompt={currentPrompt}
            liveResponse={geminiResponse}
          />
          <ChatPanel
            title="META"
            messages={messagesMeta}
            newConversation={newConversationMeta}
            currentPrompt={currentPrompt}
            liveResponse={metaResponse}
          />
        </>
      ) : (
        <>
          {["CHATGPT", "GEMINI", "META"].map((model) => (
            <div
              key={model}
              className="flex flex-col items-center justify-center bg-background border border-input-border rounded-3xl h-full p-8 transition-all duration-500 hover:bg-input hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1.5 group cursor-default"
            >
              <div className="text-foreground tracking-[0.25em] text-xs font-extrabold uppercase mb-2">{model}</div>
              <p className="text-[11px] text-secondary/70 text-center leading-relaxed max-w-[80%]">
                Ready to respond intelligently.
              </p>
            </div>
          ))}
        </>
      )}

      <PromptBox prompt={prompt} setPrompt={setPrompt} handleOnClick={handleOnClick} />
    </>
  );
};

export default Chatcomponent;