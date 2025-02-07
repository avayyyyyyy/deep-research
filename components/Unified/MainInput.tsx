"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { Globe, ArrowUp } from "lucide-react";
import { Button } from "../ui/button";

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

const MainInput = () => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight + "px";
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
    <div className="flex flex-col min-h-[calc(100vh-173px)] items-center justify-center px-4 relative">
      {/* Main heading */}
      <h1 className="text-xl md:text-3xl font-light mb-8 text-center">
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
        {/* Bottom icons with background */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="absolute inset-0 -z-10 bg-[#1C1C1C] w-8 h-8" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Globe className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-3 z-10">
          <div className="absolute inset-0 -z-10 bg-[#1C1C1C] w-8 h-8" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowUp className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Search input */}
        <div className="w-full">
          <Textarea
            ref={textareaRef}
            className="w-full min-h-[24px] max-h-[200px] border-0 outline-none focus:ring-0 focus:outline-none active:outline-none active:ring-0 focus:border-0 active:border-0 resize-none text-lg bg-transparent overflow-hidden scrollbar-hide pb-10"
            placeholder="Ask a question..."
            rows={1}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={handleInput}
          />
        </div>
      </div>

      {/* Trending searches carousel */}
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
