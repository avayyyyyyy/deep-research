"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { ArrowUp } from "lucide-react";

import { useChatStore } from "@/lib/store";
import { generateFeedback } from "@/app/api/actions";

// Trending items data
const trendingItems = [
  "Rosa Parks",
  "El Salvador",
  "CBS",
  "French to be",
  "RFK confir",
  "Rosa Parks", // Duplicated for seamless loop
  "El Salvador",
  "CBS",
];

interface MainInputProps {
  onSubmit?: (message: string) => Promise<boolean>;
}

const MainInput = ({ onSubmit }: MainInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userMessage, setUserMessage] = useState("");
  const hasMessages = useChatStore((state) => state.messages.length);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight + "px";
    }
  };

  const handleSubmit = async (message: string) => {
    if (!message.trim()) return;

    try {
      useChatStore.getState().setIsChatPending(true);
      
      // Try to handle as a follow-up answer first
      const wasHandled = onSubmit ? await onSubmit(message) : false;
      console.log("🪵 Was message handled as follow-up?", wasHandled);
      
      // If not handled as a follow-up, process as a new query
      if (!wasHandled) {
        console.log("🪵 Processing as new query...");
        // Add user message first
        useChatStore.getState().addMessage({
          id: Date.now().toString(),
          content: message,
          type: "user",
        });

        const response = await generateFeedback({
          query: message,
        });

        console.log("🪵 Generated feedback questions:", response);

        if (response && response.length > 0) {
          // Add artificial delay before showing first question
          await new Promise((resolve) => setTimeout(resolve, 1000));

          useChatStore.getState().addMessage({
            id: (Date.now() + 1).toString(),
            content: response[0],
            type: "assistant",
            followUpQuestions: response,
            currentQuestionIndex: 0,
          });
        }
      }

      setUserMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error:", error);
    } finally {
      useChatStore.getState().setIsChatPending(false);
    }
  };

  // Adjust height on content change
  const handleInput = () => {
    adjustTextareaHeight();
  };

  // Initial height adjustment
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center px-4 ${
        hasMessages
          ? "fixed bottom-0 left-0 right-0 py-4"
          : "min-h-[calc(100vh-220px)] relative"
      }`}
    >
      {/* Main heading - only show when no messages */}
      <h1
        className={`text-xl md:text-3xl font-light mb-8 text-center ${
          hasMessages ? "hidden" : ""
        }`}
      >
        What do you want to search?
      </h1>

      {/* Search input container */}
      <div
        className={`flex max-w-2xl w-full border rounded-2xl mx-auto justify-between items-center p-4 bg-[#1C1C1C] transition-all duration-200 relative ${
          isFocused
            ? "border-gray-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            : "border-gray-800"
        }`}
      >
        {/* Modified ArrowUp button to handle submission */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={() => handleSubmit(userMessage)}
            disabled={!userMessage.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-800"
          >
            <ArrowUp className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search input */}
        <div className="w-full">
          <Textarea
            ref={textareaRef}
            className="w-full min-h-[24px] max-h-[120px] border-0 outline-none focus:ring-0 focus:outline-none active:outline-none active:ring-0 focus:border-0 active:border-0 resize-none text-lg bg-transparent overflow-hidden scrollbar-hide pb-10"
            placeholder="Ask a question..."
            rows={1}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={handleInput}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
        </div>
      </div>

      {/* Trending searches carousel - only show when no messages */}
      {!hasMessages && (
        <div className="relative max-w-2xl w-full mt-6 overflow-hidden">
          {/* Fade effects */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Scrolling container */}
          <div className="trending-scroll flex gap-2 whitespace-nowrap">
            {/* First set */}
            <div className="flex gap-2 animate-scroll">
              {trendingItems.map((text, index) => (
                <TrendingItem key={`${text}-${index}`} text={text} />
              ))}
            </div>
            {/* Duplicated set for seamless loop */}
            <div className="flex gap-2 animate-scroll">
              {trendingItems.map((text, index) => (
                <TrendingItem key={`${text}-${index}-dup`} text={text} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Trending item component
const TrendingItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C1C] text-sm">
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 7L17 11M17 11L13 15M17 11H3M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
      <span className="text-gray-500">Trending</span>
    </div>
  );
};

export default MainInput;
