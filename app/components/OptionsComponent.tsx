"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { OptionsMenu, useOptionsMenuStore, useChatHistoryStore } from "../zustand/store";
import { deleteChat } from "../reqHandlers/deleteChat.reqHandlers";
import { renameChat } from "../reqHandlers/renameChat.reqHandlers";

const OptionsComponent = () => {
  const options = useOptionsMenuStore((state) => state.options);
  const setOptionsMenu = useOptionsMenuStore((state) => state.setOptions);

  const removeChat = useChatHistoryStore((state) => state.removeChat);
  const updateChatName = useChatHistoryStore((state) => state.updateChatName);

  const router = useRouter();
  const pathname = usePathname();

  const [renameComponent, setRenameComponent] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");

  const handleOnClickDeleteOptionClick = async (): Promise<void> => {
    try {
      setOptionsMenu({ ...options, visibility: false });
      const res = await deleteChat(options);
      if (res.success) {
        removeChat(options.componentID);
        if (pathname === `/chat/${options.componentID}`) {
          router.push('/chat/newChat');
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleOnClickRenameOptionClick = (): void => {
    setOptionsMenu({ ...options, visibility: false });
    setRenameComponent(true);
  };

  const handleOnClickRenameChatClick = async (): Promise<void> => {
    if (!newName.trim()) {
      console.warn("Chat name cannot be empty.");
      return;
    }

    try {
      const res = await renameChat(options, newName);
      if (res.success) {
        updateChatName(options.componentID, newName);
      }
      setRenameComponent(false);
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  const renameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (renameRef.current && !renameRef.current.contains(e.target as Node)) {
        setRenameComponent(false);
      }
    };

    if (renameComponent) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [renameComponent]);

  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsMenu({ ...options, visibility: false });
      }
    };
    if (optionsRef) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [options]);

  return (
    <>
      {/* Rename Chat Modal */}
      {renameComponent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            ref={renameRef}
            className="bg-input border border-input-border w-80 rounded-2xl p-6 shadow-2xl flex flex-col items-center"
          >
            <h1 className="text-lg font-bold text-foreground mb-4">Rename Chat</h1>
            <input
              type="text"
              placeholder="Add a new name"
              className="bg-background border border-input-border text-foreground w-full rounded-xl h-11 text-[14px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent px-4 mb-6 placeholder-secondary transition-all"
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOnClickRenameChatClick();
              }}
            />
            <button
              onClick={handleOnClickRenameChatClick}
              className="bg-accent text-foreground rounded-xl w-full h-11 text-sm font-bold shadow-md shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Rename
            </button>
          </div>
        </div>
      )}

      {/* Options Menu (Rename / Delete) */}
      {options.visibility && (
        <div
          ref={optionsRef}
          className="fixed bg-input border border-input-border rounded-xl w-40 shadow-xl overflow-hidden py-1 z-50 flex flex-col"
          style={{ top: options.y, left: options.x }}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-background transition-colors text-[13px] font-medium text-foreground"
            onClick={handleOnClickRenameOptionClick}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-background transition-colors text-[13px] font-medium text-red-500 hover:text-red-400"
            onClick={handleOnClickDeleteOptionClick}
          >
            Delete Chat
          </button>
        </div>
      )}
    </>
  );
};

export default OptionsComponent;
