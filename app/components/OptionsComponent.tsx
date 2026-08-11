"use client";

import React, { useEffect, useRef, useState } from "react";
import { OptionsMenu, useOptionsMenuStore } from "../zustand/store";
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
      await deleteChat(options); // Call API to delete chat
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
      await renameChat(options, newName); // Call API to rename chat
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
        <div
          ref={renameRef}
          className="absolute bg-primary h-auto w-80 rounded-xl text-[12px] p-7 shadow-[0_0px_20px_rgba(255,0,0,0)] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        >
          <h1 className="pb-5">RENAME CHAT</h1>
          <input
            type="text"
            placeholder="Add a new name"
            className="w-full mb-5 focus:outline-0"
            onChange={(e) => setNewName(e.target.value)} // Update input state
          />
          <button onClick={handleOnClickRenameChatClick}>Rename</button>
        </div>
      )}

      {/* Options Menu (Rename / Delete) */}
      <div
        ref={optionsRef}
        className="absolute bg-primary h-20 w-40 grid grid-rows-2 rounded-xl top-52 items-center text-[12px] px-3 shadow-[0_0px_20px_rgba(255,0,0,0)]"
        style={{ display: options.visibility ? "grid" : "none", top: options.y, left: options.x }}
      >
        <div onClick={handleOnClickRenameOptionClick}>RENAME</div>
        <div onClick={handleOnClickDeleteOptionClick}>DELETE CHAT</div>
      </div>
    </>
  );
};

export default OptionsComponent;
