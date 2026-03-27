/**
 * Theme utilities — apply CSS class to the document root based on
 * "light" | "dark" | "system" preference.
 */

type ThemePreference = "light" | "dark" | "system";

let _mediaQuery: MediaQueryList | null = null;
let _systemListener: (() => void) | null = null;

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

function applyColorScheme(scheme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(scheme);
  root.setAttribute("data-theme", scheme);
}

/** Apply the given theme preference to the document. */
export function applyTheme(preference: ThemePreference) {
  // Remove existing system listener
  if (_mediaQuery && _systemListener) {
    _mediaQuery.removeEventListener("change", _systemListener);
    _systemListener = null;
  }

  if (preference === "system") {
    _mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    _systemListener = () => {
      applyColorScheme(_mediaQuery!.matches ? "dark" : "light");
    };
    _mediaQuery.addEventListener("change", _systemListener);
    applyColorScheme(_mediaQuery.matches ? "dark" : "light");
  } else {
    applyColorScheme(preference);
  }
}

/** Resolve the effective scheme from a stored preference. */
export { resolveTheme };
