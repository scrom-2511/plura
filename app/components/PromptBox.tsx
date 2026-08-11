"use client";

import React from "react";

type PromptBoxProps = {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleOnClick: () => void;
};

const PromptBox = ({ prompt, setPrompt, handleOnClick }: PromptBoxProps) => {
  const onPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (typeof newValue === "string") {
      setPrompt(newValue);
    }
  };

  return (
    // Container div for textarea and button
    <div className="w-full col-span-4 lg:col-span-0 lg:col-start-1">
      <div className="bg-input border border-input-border rounded-2xl flex items-center px-6 py-4 shadow-lg transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent mt-2">
        {/* Textarea for user input */}
        <textarea
          name="prompt"
          id="prompt"
          rows={1}
          className="resize-none focus:outline-none w-full bg-transparent text-sm text-foreground overflow-hidden py-3 placeholder:text-secondary/50"
          placeholder="Type a message..."
          value={prompt}
          onChange={onPromptChange}
        />
        {/* Button to trigger send action */}
        <button
          onClick={handleOnClick}
          disabled={!prompt.trim()}
          className="ml-4 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent text-white p-2.5 rounded-full transition-all shrink-0 shadow-md hover:shadow-lg flex items-center justify-center group"
          title="Send Message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PromptBox;
