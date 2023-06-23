import { useEffect, useMemo, useState } from 'react';

export function useMeasure() {
  const [element, elementRef] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const resizeObserver = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new ResizeObserver((entries) => {
            setSize({
              width: entries[0].contentRect.width,
              height: entries[0].contentRect.height,
            });
          })
        : null,
    [],
  );

  useEffect(() => {
    if (!element || !ResizeObserverEntry) return;
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [element, resizeObserver]);

  return [elementRef, size] as const;
}
