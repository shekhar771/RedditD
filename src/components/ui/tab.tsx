"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = React.useState({
    left: "0px",
    width: "0px",
    opacity: 0,
  });
  const [activeStyle, setActiveStyle] = React.useState({
    left: "0px",
    width: "0px",
  });
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Get all the trigger elements
  const triggers = React.Children.toArray(children).filter(
    (child: any) => child.type.displayName === "TabsTrigger"
  );

  React.useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          opacity: 1,
        });
      }
    } else {
      setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredIndex]);

  // Update active indicator position when active tab changes
  React.useEffect(() => {
    const activeElement = tabRefs.current.find(
      (el) => el?.getAttribute("data-state") === "active"
    );
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [children]);

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-10 items-center justify-center p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {/* Hover Highlight */}
      <div
        className="absolute h-[30px] bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px]"
        style={{
          ...hoverStyle,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hoveredIndex !== null ? "scale(1.02)" : "scale(1)",
        }}
      />

      {/* Active Indicator */}
      <div
        className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white"
        style={{
          ...activeStyle,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Enhanced Triggers */}
      {React.Children.map(children, (child, index) => {
        if (
          React.isValidElement(child) &&
          child.type.displayName === "TabsTrigger"
        ) {
          return React.cloneElement(child, {
            ref: (el: HTMLButtonElement) => (tabRefs.current[index] = el),
            className: cn(
              child.props.className,
              "relative h-[30px] px-3 py-2 transition-colors duration-300",
              "data-[state=active]:text-[#0e0e10] dark:data-[state=active]:text-white",
              "data-[state=inactive]:text-[#0e0f1199] dark:data-[state=inactive]:text-[#ffffff99]",
              "hover:text-[#0e0e10cc] dark:hover:text-[#ffffffcc]"
            ),
            onMouseEnter: () => setHoveredIndex(index),
            onMouseLeave: () => setHoveredIndex(null),
          });
        }
        return child;
      })}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium",
      "ring-offset-background transition-all focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
