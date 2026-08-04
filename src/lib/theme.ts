export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "articlyapp-theme";

/**
 * Runs synchronously in <head>, before hydration, so the correct theme class
 * is on <html> before first paint. Keep in sync with ThemeProvider's own
 * resolution logic if that ever changes.
 */
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=(s==="light"||s==="dark"||s==="system")?s:"system";var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="system"?(dark?"dark":"light"):t;var el=document.documentElement;el.classList.toggle("dark",r==="dark");el.setAttribute("data-theme",t);el.style.colorScheme=r;}catch(e){}})();`;
