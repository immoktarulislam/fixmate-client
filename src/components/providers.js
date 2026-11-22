"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

/** Client shell: dark/light theme + toast notifications for the whole app. */
export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "rounded-lg border border-border bg-card text-card-foreground shadow-lg",
          },
        }}
      />
    </ThemeProvider>
  );
}
