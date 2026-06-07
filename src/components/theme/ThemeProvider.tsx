import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// ── ThemeProvider ─────────────────────────────────────────────────────────────
// Wraps next-themes. Toggles the `dark` class on <html> (Tailwind darkMode:class).
// Default = light (the white+blue "Blueprint Fintech" look); users can switch to
// the black+blue dark theme via the navbar toggle. Choice persists in localStorage.

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="oraclebull-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
