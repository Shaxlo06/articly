export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "articlyapp-theme";

/**
 * Runs synchronously in <head>, before hydration, so the correct theme class
 * is on <html> before first paint. Only "dark" in storage opts a returning
 * visitor into dark mode — everyone else (including first-time visitors,
 * regardless of OS preference) gets light. Keep in sync with ThemeProvider's
 * own resolution logic if that ever changes.
 */
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var t=localStorage.getItem(k)==="dark"?"dark":"light";var el=document.documentElement;el.classList.toggle("dark",t==="dark");el.setAttribute("data-theme",t);el.style.colorScheme=t;}catch(e){}})();`;
