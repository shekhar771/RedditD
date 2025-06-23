"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function TwoColumnLayout({
  mainContent,
  sidebarContent,
}: {
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative">
      {/* Floating sidebar toggle button (bottom right) */}
      {isMobile && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full p-2 h-12 w-12 shadow-lg md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      )}

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">{mainContent}</div>{" "}
          {/* Added min-w-0 */}
          {/* Sidebar */}
          <div
            className={`md:w-80 space-y-4 ${
              isMobile
                ? `fixed inset-y-0 left-0 z-40 w-72 bg-background p-4 border-r transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  } transition-transform duration-300 ease-in-out overflow-y-auto`
                : ""
            }`}
          >
            {sidebarContent}
          </div>
          {/* Overlay when sidebar is open */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
