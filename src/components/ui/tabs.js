"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight tabs (state-driven, no radix dependency).
 *   <Tabs value={tab} onValueChange={setTab}>
 *     <TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList>
 *     <TabsContent value="a">...</TabsContent>
 *   </Tabs>
 */
const TabsContext = React.createContext(null);

function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const setValue = onValueChange || setInternal;
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-card text-foreground shadow-sm"
          : "hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
