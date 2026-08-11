"use client";

import React, { useEffect, useState } from "react";
import {
  useGptStore,
  useDeepseekStore,
  useMistralStore,
  useQwenStore,
  useChatHistoryStore,
  Chat,
} from "../zustand/store";
import { v6 as uuidv6 } from "uuid";
import PromptBox from "./PromptBox";
import { useParams, usePathname, useRouter } from "next/navigation";
import { conversations } from "../reqHandlers/conversations.reqHandler";
import { ConversationEntry } from "@/types/types";

const Chatcomponent = () => {
  // ====== ROUTER & URL PARAMS ======
  const url = useParams();
  const pathname = usePathname();
  const router = useRouter();

  // ====== COMPONENT STATE ======
  const [chatComponent, setChatComponent] = useState<boolean>(false);
  const [conversation, setConversations] = useState<ConversationEntry[]>([]);
  const [currentChatID, setCurrentChatID] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  // ====== GPT STORE ======
  const [gptResponse, setGptResponse] = useState<string>("");
  const [newConversationGpt, setNewConversationGpt] = useState<boolean>(false);
  const messagesGpt = useGptStore((state) => state.messages);
  const addConversationGpt = useGptStore((state) => state.addConversation);
  const clearGpt = useGptStore((state) => state.clearMessages);

  // ====== DEEPSEEK STORE ======
  const [deepseekResponse, setDeepseekResponse] = useState<string>("");
  const [newConversationDeepseek, setNewConversationDeepseek] = useState<boolean>(false);
  const messagesDeepseek = useDeepseekStore((state) => state.messages);
  const addConversationDeepseek = useDeepseekStore((state) => state.addConversation);
  const clearDeepseek = useDeepseekStore((state) => state.clearMessages);

  // ====== MISTRAL STORE ======
  const [mistralResponse, setMistralResponse] = useState<string>("");
  const [newConversationMistral, setNewConversationMistral] = useState<boolean>(false);
  const messagesMistral = useMistralStore((state) => state.messages);
  const addConversationMistral = useMistralStore((state) => state.addConversation);
  const clearMistral = useMistralStore((state) => state.clearMessages);

  // ====== QWEN STORE ======
  const [qwenResponse, setQwenResponse] = useState<string>("");
  const [newConversationQwen, setNewConversationQwen] = useState<boolean>(false);
  const messagesQwen = useQwenStore((state) => state.messages);
  const addConversationQwen = useQwenStore((state) => state.addConversation);
  const clearQwen = useQwenStore((state) => state.clearMessages);

  // ====== CHAT HISTORY STORE ======
  const { addChat } = useChatHistoryStore();

  // ====== EFFECT: Set Current Chat ID ======
  useEffect(() => {
    setCurrentChatID(url.chatID as string);
  }, [url.chatID]);

  // ====== EFFECT: Handle Pending Prompt from SessionStorage ======
  useEffect(() => {
    if (!url.chatID || pathname.includes("newChat")) return;
    console.log("Checking for pending prompt...");

    const pendingPrompt = sessionStorage.getItem("pendingPrompt");
    if (pendingPrompt) {
      // Set up the UI state for the new chat
      setCurrentPrompt(pendingPrompt);
      setChatComponent(true);
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
  }, [url.chatID, pathname]);

  // ====== EFFECT: Check Chat ID on Mount ======
  useEffect(() => {
    if (url.chatID && url.chatID !== "newChat") {
      setChatComponent(true);
    }
  }, [url.chatID]);

  // ====== EFFECT: Load Conversations into Stores & Cleanup ======
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
      addConversationQwen({
        prompt: entry.prompt,
        response: entry.qwen ?? "There was an error getting the response.",
      });
    });

    // Cleanup function to clear all messages on unmount or conversation change
    return () => {
      clearGpt();
      clearDeepseek();
      clearMistral();
      clearQwen();
    };
  }, [conversation, addConversationGpt, addConversationDeepseek, addConversationMistral, addConversationQwen, clearGpt, clearDeepseek, clearMistral, clearQwen]);

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

    try {
      const response = await fetch(`http://localhost:3000/api/aiModels/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.body) {
        console.error("Response body is null");
        setNewConversation(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
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
      }
    } catch (error) {
      console.error(`Error streaming model ${model}:`, error);
      setNewConversation(false);
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
      streamModel("qwen", setQwenResponse, addConversationQwen, setNewConversationQwen, conversationID, chatID, promptText),
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
          <ChatPanel
            title="QWEN"
            messages={messagesQwen}
            newConversation={newConversationQwen}
            currentPrompt={currentPrompt}
            liveResponse={qwenResponse}
          />
        </>
      ) : (
        <NoChatComponent />
      )}

      <PromptBox prompt={prompt} setPrompt={setPrompt} handleOnClick={handleOnClick} />
    </>
  );
};

export default Chatcomponent;

type ChatPanelProps = {
  title: string;
  messages: { prompt: string; response: string }[];
  newConversation: boolean;
  currentPrompt: string;
  liveResponse: string;
};

const ChatPanel = ({
  title,
  messages,
  newConversation,
  currentPrompt,
  liveResponse,
}: ChatPanelProps) => (
  <div className="bg-background border border-input-border rounded-3xl flex flex-col h-full overflow-hidden shadow-xl transition-all duration-300">
    {/* Header */}
    <div className="sticky top-0 bg-background/95 z-10 px-4 py-4 border-b border-input-border shadow-sm flex items-center justify-center backdrop-blur-md">
      <div className="w-2 h-2 rounded-full bg-accent animate-pulse mr-3 hidden sm:block"></div>
      <h1 className="text-center text-xs font-extrabold tracking-[0.2em] text-foreground uppercase">{title}</h1>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm space-y-6 scroll-smooth">
      {messages.length === 0 && !newConversation && (
        <div className="h-full flex flex-col items-center justify-center opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-secondary tracking-widest uppercase text-[10px] font-bold">No Messages</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={`${message.prompt}-${index}`} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* User Side */}
          <div className="self-end max-w-[90%] bg-accent text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md">
            <p className="leading-relaxed whitespace-pre-wrap">{message.prompt}</p>
          </div>
          {/* Model Side */}
          <div className="self-start max-w-[95%] bg-input border border-input-border text-foreground px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
            <p className="leading-relaxed whitespace-pre-wrap">{message.response}</p>
          </div>
        </div>
      ))}
      
      {newConversation && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="self-end max-w-[90%] bg-accent text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md">
            <p className="leading-relaxed whitespace-pre-wrap">{currentPrompt}</p>
          </div>
          <div className="self-start max-w-[95%] bg-input border border-input-border text-foreground px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm relative min-w-12">
            <p className="leading-relaxed whitespace-pre-wrap">{liveResponse}</p>
            {/* Blinking indicator for streaming */}
            {!liveResponse && (
              <div className="flex gap-1.5 items-center justify-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-150" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-300" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * NoChatComponent shown when no chat is active.
 */
const NoChatComponent = () => (
  <>
    {["CHATGPT", "DEEPSEEK", "MISTRAL", "QWEN"].map((model) => (
      <div 
        key={model} 
        className="flex flex-col items-center justify-center bg-background border border-input-border rounded-3xl h-full p-8 transition-all duration-500 hover:bg-input hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1.5 group cursor-default"
      >
        <div className="w-16 h-16 rounded-2xl bg-input border border-input-border flex items-center justify-center mb-6 shadow-sm text-secondary group-hover:text-accent group-hover:bg-background transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-accent/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="text-foreground tracking-[0.25em] text-xs font-extrabold uppercase mb-2">{model}</div>
        <p className="text-[11px] text-secondary/70 text-center leading-relaxed max-w-[80%]">
          Ready to respond intelligently.
        </p>
      </div>
    ))}
  </>
);