// components/layout/PageLayoutWrapper.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Home } from "lucide-react";
import { Subreddit } from "@prisma/client";
import SubredditSidebar from "@/app/r/[slug]/sidebar";

interface PageLayoutWrapperProps {
  children: React.ReactNode;
  subreddit?: Subreddit;
  subscriberCount?: number;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  className?: string;
}

const PageLayoutWrapper: React.FC<PageLayoutWrapperProps> = ({
  children,
  subreddit,
  subscriberCount = 0,
  showBreadcrumb = false,
  breadcrumbItems = [],
  className = "",
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const Breadcrumb = () => {
    if (!showBreadcrumb) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <button
          onClick={() => router.push("/")}
          className="hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
        >
          <Home className="h-4 w-4" />
        </button>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            {item.href || item.onClick ? (
              <button
                onClick={item.onClick || (() => router.push(item.href!))}
                className="hover:text-gray-800 dark:hover:text-gray-200 truncate max-w-[200px] md:max-w-none"
              >
                {item.label}
              </button>
            ) : (
              <span className="truncate max-w-[200px] md:max-w-none">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const MobileSidebarToggle = () => {
    if (!subreddit) return null;

    return (
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-full justify-between"
        >
          <span>Community Info</span>
          {isSidebarOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isSidebarOpen && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <SubredditSidebar
              subreddit={subreddit}
              subscriberCount={subscriberCount}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 py-2 md:py-4 ${className}`}>
      <Breadcrumb />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1 lg:max-w-3xl">
          <MobileSidebarToggle />
          {children}
        </div>

        {/* Desktop sidebar */}
        {subreddit && (
          <div className="w-80 hidden lg:block sticky top-4 h-fit">
            <SubredditSidebar
              subreddit={subreddit}
              subscriberCount={subscriberCount}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayoutWrapper;
