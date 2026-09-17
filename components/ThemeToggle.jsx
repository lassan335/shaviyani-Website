"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "shaviyani-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — theme just won't persist across reloads
    }
    setTheme(next);
  }

  return (
    <button className="themeToggleBtn" onClick={toggle} aria-label="Toggle day/night mode">
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
