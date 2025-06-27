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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative">
      {/* Floating sidebar toggle button */}
      {isMobile && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 shadow-lg border-2 md:hidden hover:scale-105 transition-transform"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      )}

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">{mainContent}</div>

          {/* Sidebar */}
          <div
            className={`md:w-80 ${
              isMobile
                ? `fixed inset-0 z-40 bg-background transform ${
                    isSidebarOpen ? "translate-y-0" : "translate-y-full"
                  } transition-transform duration-300 ease-out`
                : ""
            }`}
          >
            {isMobile && isSidebarOpen ? (
              // Mobile sidebar with header
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                  <h2 className="text-lg font-semibold">Community Info</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 pb-20">
                  <div className="space-y-4">{sidebarContent}</div>
                </div>
              </div>
            ) : (
              // Desktop sidebar
              <div className="space-y-4">{sidebarContent}</div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
