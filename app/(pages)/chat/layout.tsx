"use client";

import LeftComponent from "@/app/components/LeftComponent";
import OptionsComponent from "@/app/components/OptionsComponent";
import { useSidebarStore } from "@/app/zustand/store";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggleSidebar);

  return (
    <>
      <OptionsComponent />
      <div className="h-screen w-screen flex bg-background overflow-hidden relative">
        {/* Left loads ONCE and persists */}
        <div
          className={`transition-all duration-300 ease-in-out shrink-0 h-full z-20 bg-background overflow-hidden
            ${isOpen ? 'w-65 opacity-100' : 'w-0 opacity-0'}
          `}
        >
          <LeftComponent />
        </div>

        {/* Right side is dynamic and changes with routing */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full h-full relative">
          <button
            onClick={toggle}
            className="absolute top-4 left-4 z-10 p-2 bg-input border border-input-border rounded-xl text-secondary hover:text-foreground hover:bg-input-border transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="flex-1 h-full w-full">{children}</div>
        </div>
      </div>
    </>
  );
};

export default ChatLayout;
