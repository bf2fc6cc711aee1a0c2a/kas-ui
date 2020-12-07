import { useEffect, useRef } from "react";

export function useInterval(callback: any, delay: number) {
  const savedCalllback = useRef<any>();

  useEffect(() => {
    savedCalllback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCalllback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}
