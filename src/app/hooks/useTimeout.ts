import { useEffect, useRef } from "react";

export function useTimeout(callback: () => void, delay: number): void {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== null) {
      const id = setTimeout(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
    return;
  }, [callback, delay]);
}
