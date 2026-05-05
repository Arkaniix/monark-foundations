import { useEffect, useRef, useState } from "react";

export function useInView(
  threshold: number = 0.25
): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null as unknown as HTMLElement);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}

export default useInView;