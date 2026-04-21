"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="h-9 px-4 rounded-full border border-border bg-transparent flex items-center gap-2 text-sm font-mono uppercase tracking-wider"
        aria-label="Toggle theme"
      >
        <div className="h-4 w-4" />
        <span className="text-xs">Light</span>
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 px-4 rounded-full border border-border bg-transparent hover:bg-secondary flex items-center gap-2 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4" />
      <span className="text-xs font-mono uppercase tracking-wider">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
