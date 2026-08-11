"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { chatHistory } from "../reqHandlers/chatHistory.reqHandler";
import { OptionsMenu, useChatHistoryStore, useOptionsMenuStore } from "../zustand/store";

const LeftComponent = () => {
  const router = useRouter();
  const hasLoadedRef = useRef(false);

  const setOptionsMenu = useOptionsMenuStore((state) => state.setOptions)

  const { chats, appendChat, clearChat } = useChatHistoryStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const getChatHistory = async () => {
      try {
        const result = await chatHistory(1, 1);

        if (result.success) {
          console.log(result.data.data);
          appendChat(result.data.data);
        } else {
          console.error("Failed to fetch chat history", result.error);
        }
      } catch (err) {
        console.error("Unexpected error fetching chat history:", err);
      }
    };

    getChatHistory();
    return () => {
      clearChat()
    }
  }, []);

  const handleOnClickMenu = (e: React.MouseEvent<HTMLElement>, componentID: string) => {
    e.stopPropagation();
    const options: OptionsMenu = { x: e.clientX, y: e.clientY, componentID, visibility: true }
    setOptionsMenu(options)
  }

  return (
    <div className="w-full flex flex-col h-full bg-background border-r border-input-border overflow-hidden">
      <p className="text-center text-xl font-extrabold tracking-[0.2em] text-foreground uppercase py-6">PLURA</p>
      {/* Top Section: NEW CHAT button and Search bar */}
      <div className="w-full flex flex-col items-center gap-4 px-6 shrink-0">
        <button
          className="bg-accent text-white rounded-xl w-full h-12 text-[12px] font-bold shadow-md shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => router.push("/chat/newChat")}
        >
          NEW CHAT
        </button>
        <div className="relative w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="bg-input text-foreground border border-input-border w-full rounded-xl h-11 text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent pl-10 pr-4 transition-all placeholder-secondary"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List Section */}
      <div className="w-full flex-1 flex flex-col items-center gap-2 overflow-y-auto px-4 pb-6 scrollbar-hide">
        {chats
          .filter((chat) =>
            chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((chat) => (
          <div
            key={chat.chatUUID}
            className="group bg-transparent hover:bg-input border border-transparent hover:border-input-border rounded-xl w-full min-h-16 flex items-center justify-between cursor-pointer px-3 py-2 transition-all"
            onClick={() => {
              router.push(`/chat/${chat.chatUUID}`);
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-sm text-foreground truncate">{chat.chatName}</h3>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-input-border rounded-lg transition-all"
              onClick={(e) => handleOnClickMenu(e, chat.chatUUID)}
            >
              <img src="/menu.svg" alt="Options" className="invert h-4 opacity-50 hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftComponent;
