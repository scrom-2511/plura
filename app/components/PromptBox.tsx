"use client";

import React from "react";

type PromptBoxProps = {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleOnClick: () => void;
};

const PromptBox = ({ prompt, setPrompt, handleOnClick }: PromptBoxProps) => {
  // Handler for textarea changes with input validation to ensure string value
  const onPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (typeof newValue === "string") {
      setPrompt(newValue);
    }
  };

  return (
    // Container div for textarea and button
    <div className="col-span-2 col-start-2 bg-primary rounded-2xl flex items-center px-10">
      {/* Textarea for user input */}
      <textarea
        name="prompt"
        id="prompt"
        className="resize-none focus:outline-0 w-full text-sm text-secondary"
        placeholder="Ask Anything"
        value={prompt}
        onChange={onPromptChange}
      />
      {/* Button to trigger send action */}
      <button onClick={handleOnClick}>SEND</button>
    </div>
  );
};

export default PromptBox;
