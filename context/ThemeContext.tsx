import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "light" | "dark" | "grey" | "midnight" | "sepia";
export type ColorTheme = "hope" | "bloom" | "renewal" | "harmony" | "sunrise" | "teal" | "blue" | "violet" | "rose" | "orange" | "emerald" | "indigo" | "amber" | "fuchsia" | "cyan";

interface ThemeContextType {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  setTheme: (theme: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color definitions for themes
const THEMES: Record<ColorTheme, Record<string, string>> = {
  // Recovery-focused themes designed for happiness and hope
  hope: {
    // Gold, warm orange - represents sunrise, new beginnings, warmth
    "50": "#fffaf0", "100": "#fef3e2", "200": "#fee5c3", "300": "#fdd8a8",
    "400": "#fbba6d", "500": "#f59e0b", "600": "#d97706", "700": "#b45309",
    "800": "#92400e", "900": "#78350f", "950": "#451a03",
  },
  bloom: {
    // Coral, pink, rose - represents compassion, warmth, growth
    "50": "#fff1f2", "100": "#ffe4e6", "200": "#fecdd3", "300": "#fda4af",
    "400": "#fb7185", "500": "#f43f5e", "600": "#e11d48", "700": "#be123c",
    "800": "#9f1239", "900": "#881337", "950": "#500724",
  },
  renewal: {
    // Vibrant emerald green - represents growth, healing, new life
    "50": "#ecfdf5", "100": "#d1fae5", "200": "#a7f3d0", "300": "#6ee7b7",
    "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857",
    "800": "#065f46", "900": "#064e3b", "950": "#022c22",
  },
  harmony: {
    // Soft lavender to violet - represents calm, balance, hope
    "50": "#f5f3ff", "100": "#ede9fe", "200": "#ddd6fe", "300": "#c4b5fd",
    "400": "#a78bfa", "500": "#8b5cf6", "600": "#7c3aed", "700": "#6d28d9",
    "800": "#5b21b6", "900": "#4c1d95", "950": "#2e1065",
  },
  sunrise: {
    // Gradient from coral to gold - represents new hope, dawn
    "50": "#fef3f2", "100": "#fde8e4", "200": "#fcccc4", "300": "#faa590",
    "400": "#f77d5e", "500": "#ef5350", "600": "#e53935", "700": "#c62828",
    "800": "#ad1457", "900": "#6a0572", "950": "#420a3e",
  },
  teal: {
    "50": "#f0fdfa", "100": "#ccfbf1", "200": "#99f6e4", "300": "#5eead4",
    "400": "#2dd4bf", "500": "#14b8a6", "600": "#0d9488", "700": "#0f766e",
    "800": "#115e59", "900": "#134e4a", "950": "#042f2e",
  },
  blue: {
    "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd",
    "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8",
    "800": "#1e40af", "900": "#1e3a8a", "950": "#172554",
  },
  violet: {
    "50": "#f5f3ff", "100": "#ede9fe", "200": "#ddd6fe", "300": "#c4b5fd",
    "400": "#a78bfa", "500": "#8b5cf6", "600": "#7c3aed", "700": "#6d28d9",
    "800": "#5b21b6", "900": "#4c1d95", "950": "#2e1065",
  },
  rose: {
    "50": "#fff1f2", "100": "#ffe4e6", "200": "#fecdd3", "300": "#fda4af",
    "400": "#fb7185", "500": "#f43f5e", "600": "#e11d48", "700": "#be123c",
    "800": "#9f1239", "900": "#881337", "950": "#4c0519",
  },
  orange: {
    "50": "#fff7ed", "100": "#ffedd5", "200": "#fed7aa", "300": "#fdba74",
    "400": "#fb923c", "500": "#f97316", "600": "#ea580c", "700": "#c2410c",
    "800": "#9a3412", "900": "#7c2d12", "950": "#431407",
  },
  emerald: {
    "50": "#ecfdf5", "100": "#d1fae5", "200": "#a7f3d0", "300": "#6ee7b7",
    "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857",
    "800": "#065f46", "900": "#064e3b", "950": "#022c22",
  },
  indigo: {
    "50": "#eef2ff", "100": "#e0e7ff", "200": "#c7d2fe", "300": "#a5b4fc",
    "400": "#818cf8", "500": "#6366f1", "600": "#4f46e5", "700": "#4338ca",
    "800": "#3730a3", "900": "#312e81", "950": "#1e1b4b",
  },
  amber: {
    "50": "#fffbeb", "100": "#fef3c7", "200": "#fde68a", "300": "#fcd34d",
    "400": "#fbbf24", "500": "#f59e0b", "600": "#d97706", "700": "#b45309",
    "800": "#92400e", "900": "#78350f", "950": "#451a03",
  },
  fuchsia: {
    "50": "#fdf4ff", "100": "#fae8ff", "200": "#f5d0fe", "300": "#f0abfc",
    "400": "#e879f9", "500": "#d946ef", "600": "#c026d3", "700": "#a21caf",
    "800": "#86198f", "900": "#701a75", "950": "#4a044e",
  },
  cyan: {
    "50": "#ecfeff", "100": "#cffafe", "200": "#a5f3fc", "300": "#67e8f9",
    "400": "#22d3ee", "500": "#06b6d4", "600": "#0891b2", "700": "#0e7490",
    "800": "#155e75", "900": "#164e63", "950": "#083344",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("themeMode") as ThemeMode;
    if (savedTheme) return savedTheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem("colorTheme") as ColorTheme) || "hope";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "grey", "midnight", "sepia");

    if (theme !== "light") {
      document.documentElement.classList.add(theme);
    }

    // Auto-add .dark for compatibility with Tailwind dark mode if using a dark variant
    if (["dark", "grey", "midnight"].includes(theme)) {
      document.documentElement.classList.add("dark");
    }

    localStorage.setItem("themeMode", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = THEMES[colorTheme];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value as string);
    });

    localStorage.setItem("colorTheme", colorTheme);
  }, [colorTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, colorTheme, setTheme, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
