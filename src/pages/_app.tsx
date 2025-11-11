import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

import "@/styles/globals.css";
import React, { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark" | "contrast";
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
// Moved useTheme to ThemeContext.ts for fast refresh compatibility

// ThemeProvider logic:
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");
  
  // Detect system preference
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const storedTheme = stored === "dark" || stored === "light" || stored === "contrast" ? (stored as Theme) : null;
    if (storedTheme) {
      setTheme(stored as Theme);
    } else if (typeof window !== "undefined") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    }
  }, []);
  
  // Apply theme to html tag
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("contrast", theme === "contrast");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    const order: Theme[] = ["dark", "light", "contrast"];
    setTheme((current) => {
      const nextIndex = (order.indexOf(current) + 1) % order.length;
      return order[nextIndex];
    });
  }, []);

  const themeLabel = {
    light: "🌤️ Light",
    dark: "🌙 Dark",
    contrast: "⚡ High Contrast",
  }[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      {/* Temporary minimal theme toggle for testing */}
      <button
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 9999,
          padding: "0.5rem 1rem",
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          opacity: 0.8,
          cursor: "pointer",
          fontSize: 16
        }}
        onClick={toggleTheme}
      >
        {themeLabel}
      </button>
    </ThemeContext.Provider>
  );
}

function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount: number, error: unknown) => {
          if (typeof error === 'object' && error !== null && 'status' in error) {
            const status = (error as { status?: number }).status;
            if (status === 401 || status === 403) {
              return false;
            }
          }
          return failureCount < 3;
        }
      }
    }
  }));

  // Check if this is a special page that needs minimal wrapping
  const errorPages = ["404", "500", "_error"];
  const componentName = Component.displayName ?? Component.name ?? "";
  const isErrorPage = errorPages.includes(componentName);

  // Wrap error pages with minimal context
  if (isErrorPage) {
    return (
      <div id="__next">
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div suppressHydrationWarning>
              {!mounted ? (
                // Show a loading state that matches your app's design
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Component {...pageProps} />
              )}
            </div>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
