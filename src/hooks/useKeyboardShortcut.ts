
import { useEffect, useCallback } from "react";

export function useKeyboardShortcut(
  key: string,
  cb: () => void,
  opts?: { preventDefault?: boolean },
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      // don't steal keystrokes while user is typing
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === key) {
        if (opts?.preventDefault) e.preventDefault();
        cb();
      }
    },
    [key, cb, opts?.preventDefault], // eslint-disable-line
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}