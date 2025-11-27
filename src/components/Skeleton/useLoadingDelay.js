import { useEffect, useRef, useState } from "react";

// Shows skeleton after `delay` and keeps it visible for at least `minDuration` once shown.
export function useLoadingDelay(
  isLoading,
  delay = 200,
  minDuration = 350,
  immediateOnMount = false
) {
  const [show, setShow] = useState(false);
  const shownAtRef = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      // schedule showing after delay
      timerRef.current && clearTimeout(timerRef.current);
      const shouldShowImmediately = immediateOnMount && !mountedRef.current;
      if (shouldShowImmediately) {
        shownAtRef.current = Date.now();
        setShow(true);
      } else {
        timerRef.current = setTimeout(() => {
          shownAtRef.current = Date.now();
          setShow(true);
        }, delay);
      }
    } else {
      // hide respecting minDuration if currently shown
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (show) {
        const elapsed = Date.now() - shownAtRef.current;
        const remaining = Math.max(0, minDuration - elapsed);
        timerRef.current = setTimeout(() => {
          setShow(false);
          timerRef.current = null;
        }, remaining);
      } else {
        setShow(false);
      }
    }
    mountedRef.current = true;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, delay, minDuration, show, immediateOnMount]);

  return show;
}

export default useLoadingDelay;
