"use client";

import React, { useEffect, useState } from "react";
import {
  useGptStore,
  useDeepseekStore,
  useMistralStore,
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
  //  ROUTER & URL PARAMS 
  const url = useParams();
  const pathname = usePathname();
  const router = useRouter();

  //  COMPONENT STATE 
  const [chatComponent, setChatComponent] = useState<boolean>(false);
  const [conversation, setConversations] = useState<ConversationEntry[]>([]);
  const [currentChatID, setCurrentChatID] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  //  GPT STORE 
  const [gptResponse, setGptResponse] = useState<string>("");
  const [newConversationGpt, setNewConversationGpt] = useState<boolean>(false);
  const messagesGpt = useGptStore((state) => state.messages);
  const addConversationGpt = useGptStore((state) => state.addConversation);
  const clearGpt = useGptStore((state) => state.clearMessages);

  //  DEEPSEEK STORE 
  const [deepseekResponse, setDeepseekResponse] = useState<string>("");
  const [newConversationDeepseek, setNewConversationDeepseek] = useState<boolean>(false);
  const messagesDeepseek = useDeepseekStore((state) => state.messages);
  const addConversationDeepseek = useDeepseekStore((state) => state.addConversation);
  const clearDeepseek = useDeepseekStore((state) => state.clearMessages);

  //  MISTRAL STORE 
  const [mistralResponse, setMistralResponse] = useState<string>("");
  const [newConversationMistral, setNewConversationMistral] = useState<boolean>(false);
  const messagesMistral = useMistralStore((state) => state.messages);
  const addConversationMistral = useMistralStore((state) => state.addConversation);
  const clearMistral = useMistralStore((state) => state.clearMessages);

  //  CHAT HISTORY STORE 
  const { addChat } = useChatHistoryStore();

  //  EFFECT: Set Current Chat ID 
  useEffect(() => {
    setCurrentChatID(url.chatID as string);
  }, [url.chatID]);

  //  EFFECT: Handle URL/Chat Change 
  useEffect(() => {
    // 1. Immediately clear existing stores to prevent mixed data
    clearGpt();
    clearDeepseek();
    clearMistral();
    setConversations([]);

    if (!url.chatID || pathname.includes("newChat")) {
      setChatComponent(false); // Show empty state for new chat
      return;
    }

    setChatComponent(true);
    console.log("Checking for pending prompt...");

    const pendingPrompt = sessionStorage.getItem("pendingPrompt");
    if (pendingPrompt) {
      // Set up the UI state for the new chat
      setCurrentPrompt(pendingPrompt);
      setPrompt(""); // Clear the input

      // Remove from sessionStorage
      sessionStorage.removeItem("pendingPrompt");

      const newConversationID = uuidv6();

      // Start streaming with the retrieved prompt
      startStreaming(newConversationID, url.chatID as string, pendingPrompt);
    } else {
      const getConversations = async () => {
        try {
          const result = await conversations(1, url.chatID as string);
          if (result.success) {
            // Store fetched conversations
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
  }, [url.chatID, pathname, clearGpt, clearDeepseek, clearMistral]);

  //  EFFECT: Load Conversations into Stores & Cleanup 
  useEffect(() => {
    if (conversation.length === 0) return;

    // Load conversation entries into each AI model store
    conversation.forEach((entry) => {
      addConversationGpt({
        prompt: entry.prompt,
        response: entry.gpt ?? "There was an error getting the response.",
      });
      addConversationDeepseek({
        prompt: entry.prompt,
        response: entry.deepseek ?? "There was an error getting the response.",
      });
      addConversationMistral({
        prompt: entry.prompt,
        response: entry.mistral ?? "There was an error getting the response.",
      });
    });

    // Cleanup function to clear all messages on unmount or conversation change
    return () => {
      clearGpt();
      clearDeepseek();
      clearMistral();
    };
  }, [conversation, addConversationGpt, addConversationDeepseek, addConversationMistral, clearGpt, clearDeepseek, clearMistral]);

  const streamModel = async (
    model: string,
    setResponse: React.Dispatch<React.SetStateAction<string>>,
    addToStore: (msg: { prompt: string; response: string }) => void,
    setNewConversation: React.Dispatch<React.SetStateAction<boolean>>,
    conversationID: string,
    chatID: string,
    promptText?: string
  ): Promise<void> => {
    // Use provided prompt or fall back to component state
    const promptToUse = promptText || prompt;

    // Input validation: do not proceed if prompt is empty
    if (!promptToUse.trim()) return;

    const data = { prompt: promptToUse, userID: 1, conversationID, chatID };
    const finalPrompt = promptToUse;
    let finalResponse = "";

    // Only set current prompt and clear input if no prompt was provided (normal flow)
    if (!promptText) {
      setCurrentPrompt(promptToUse);
      setPrompt(""); // Clear prompt input
    }

    setNewConversation(true); // Mark new conversation as in-progress

    const controller = new AbortController();
    let timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 1 minute initial timeout

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

      // Read stream chunk by chunk
      timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute per chunk timeout
      while (true) {
        const { done, value } = await reader.read();
        clearTimeout(timeoutId);

        if (done) {
          // Mark conversation as complete and save to store
          setNewConversation(false);
          addToStore({ prompt: finalPrompt, response: finalResponse });
          setResponse("");
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        finalResponse += chunk;
        setResponse(finalResponse); // Update live response

        timeoutId = setTimeout(() => controller.abort(), 60000); // Reset for next chunk
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`Error streaming model ${model}:`, error);
      addToStore({ prompt: finalPrompt, response: "there was an error getting response" });
      setNewConversation(false);
      setResponse(""); // Clear any partial response on error
    }
  };

  /**
   * Handles submit button click to start conversation streams.
   */
  const handleOnClick = async (): Promise<void> => {
    if (!prompt.trim()) return;

    const newConversationID = uuidv6();
    let newChatID = currentChatID;

    if (pathname.includes("newChat")) {
      // Generate new Chat ID
      newChatID = uuidv6();

      const chat: Chat = { chatName: "New Chat", chatUUID: newChatID };

      addChat(chat);

      // Save the prompt temporarily in sessionStorage
      sessionStorage.setItem("pendingPrompt", prompt);

      // Navigate to new chat page
      router.push(`/chat/${newChatID}`);
      return; // Stop here, let the new page handle streaming
    }

    // If we're already inside a chat (not newChat), start streaming directly
    startStreaming(newConversationID, newChatID);
  };

  const startStreaming = async (conversationID: string, chatID: string, promptText?: string) => {
    await Promise.allSettled([
      streamModel("chatgpt", setGptResponse, addConversationGpt, setNewConversationGpt, conversationID, chatID, promptText),
      streamModel("deepseek", setDeepseekResponse, addConversationDeepseek, setNewConversationDeepseek, conversationID, chatID, promptText),
      streamModel("mistral", setMistralResponse, addConversationMistral, setNewConversationMistral, conversationID, chatID, promptText),
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
            title="DEEPSEEK"
            messages={messagesDeepseek}
            newConversation={newConversationDeepseek}
            currentPrompt={currentPrompt}
            liveResponse={deepseekResponse}
          />
          <ChatPanel
            title="MISTRAL"
            messages={messagesMistral}
            newConversation={newConversationMistral}
            currentPrompt={currentPrompt}
            liveResponse={mistralResponse}
          />
        </>
      ) : (
        // No chat component
        <>
          {["CHATGPT", "DEEPSEEK", "MISTRAL"].map((model) => (
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