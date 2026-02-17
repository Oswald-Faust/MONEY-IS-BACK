"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-glass-bg border border-glass-border">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover transition-all duration-200 group flex items-center justify-center"
      aria-label="Changer de thème"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
