"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  attribute?: "class" | "data-theme";
  disableTransitionOnChange?: boolean;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getAppliedTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) return getSystemTheme();
  return theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "theme",
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light");
  const [mounted, setMounted] = React.useState(false);

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const resolved = getAppliedTheme(nextTheme, enableSystem);
      const root = document.documentElement;

      if (disableTransitionOnChange) {
        const style = document.createElement("style");
        style.appendChild(
          document.createTextNode("*{transition:none!important}")
        );
        document.head.appendChild(style);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            style.remove();
          });
        });
      }

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      } else {
        root.setAttribute("data-theme", resolved);
      }

      setResolvedTheme(resolved);
    },
    [attribute, disableTransitionOnChange, enableSystem]
  );

  React.useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = saved ?? defaultTheme;
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, [applyTheme, defaultTheme, storageKey]);

  React.useEffect(() => {
    if (!mounted) return;
    if (!(theme === "system" && enableSystem)) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, enableSystem, applyTheme, mounted]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    },
    [applyTheme, storageKey]
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
