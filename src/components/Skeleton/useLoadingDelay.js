import { useEffect, useRef, useState } from "react";

export function useLoadingDelay(isLoading, delay = 200) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      if (!show && !timerRef.current) {
        timerRef.current = setTimeout(() => {
          setShow(true);
          timerRef.current = null;
        }, delay);
      }
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (show) {
        setShow(false);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, delay, show]);

  return show;
}

export default useLoadingDelay;
