import React from "react";
import { ModeToggle } from "../ui/mode-toogle";

const Header = () => {
  return (
    <div className="flex max-w-screen-xl border-b border-foreground/10 mx-auto justify-between items-center p-4">
      <div className="text-lg font-light">Deep-Search</div>
      <div>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header