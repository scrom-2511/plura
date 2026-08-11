"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { OptionsMenu, useOptionsMenuStore, useChatHistoryStore } from "../zustand/store";
import { deleteChat } from "../reqHandlers/deleteChat.reqHandlers";
import { renameChat } from "../reqHandlers/renameChat.reqHandlers";

/**
 * UI Component for rendering chat options like renaming and deleting a chat.
 */
const OptionsComponent = () => {
  /* ====
   * Zustand Global Store State
   * ==== */
  const options = useOptionsMenuStore((state) => state.options);
  const setOptionsMenu = useOptionsMenuStore((state) => state.setOptions);

  const removeChat = useChatHistoryStore((state) => state.removeChat);
  const updateChatName = useChatHistoryStore((state) => state.updateChatName);

  const router = useRouter();
  const pathname = usePathname();

  /* ====
   * Local Component State
   * ==== */
  const [renameComponent, setRenameComponent] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");

  /* ====
   * Event Handlers
   * ==== */

  /**
   * Handles deleting a chat based on current options
   */
  const handleOnClickDeleteOptionClick = async (): Promise<void> => {
    try {
      setOptionsMenu({ ...options, visibility: false });
      const res = await deleteChat(options); // Call API to delete chat
      if (res.success) {
        removeChat(options.componentID);
        if (pathname === `/chat/${options.componentID}`) {
          router.push('/chat/newChat');
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error); // Error logging
    }
  };

  /**
   * Opens rename input field
   */
  const handleOnClickRenameOptionClick = (): void => {
    setOptionsMenu({ ...options, visibility: false });
    setRenameComponent(true); // Show rename input UI
  };

  /**
   * Handles renaming the chat with the input name
   */
  const handleOnClickRenameChatClick = async (): Promise<void> => {
    // Validate input before sending to API
    if (!newName.trim()) {
      console.warn("Chat name cannot be empty."); // Input validation
      return;
    }

    try {
      const res = await renameChat(options, newName); // Call API to rename chat
      if (res.success) {
        updateChatName(options.componentID, newName);
      }
      setRenameComponent(false); // Hide rename input after success
    } catch (error) {
      console.error("Failed to rename chat:", error); // Error logging
    }
  };

  // Ref for rename modal
  const renameRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
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

  /* ====
   * Render UI
   * ==== */
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
              onChange={(e) => setNewName(e.target.value)} // Update input state
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
