import { useEffect, useRef, useState } from 'react';

export function useInViewOnce<T extends HTMLElement>(options: IntersectionObserverInit = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) {
      return;
    }

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setInView(true);
          observerInstance.disconnect();
        }
      });
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options, inView]);

  return { ref, inView } as const;
}

