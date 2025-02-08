"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";
// import { ModeToggle } from "../ui/mode-toogle";
import { useChatStore } from "@/lib/store";

const Header = () => {
  const clearMessages = useChatStore((state) => state.clearMessages);

  return (
    <div className="flex sticky top-0 backdrop-blur-sm z-50 border-b w-full border-foreground/10 mx-auto justify-between items-center p-4">
      <div className="text-lg font-light">Deep-Search</div>
      <div>
        {/* <ModeToggle /> */}
        <Button
          onClick={() => {
            clearMessages();
          }}
          variant="outline"
        >
          <PlusIcon /> New Chat
        </Button>
      </div>
    </div>
  );
};

export default Header;
