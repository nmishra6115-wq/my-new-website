import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://bauval.org/21/91761144115845052b0b2928db88c2b3';
const CONTAINER_ID = 'container-91761144115845052b0b2928db88c2b3';

export default function NativeAdBanner() {
  const hostRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!hostRef.current) return;
        if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;

        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = SCRIPT_SRC;
        script.onerror = () => {};
        hostRef.current.appendChild(script);
      } catch (err) {
        console.warn('Ad widget skipped:', err);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <aside
      aria-label="Sponsored advertisement"
      className="mx-auto my-8 w-full max-w-6xl px-4 sm:px-6"
    >
      <div
        ref={hostRef}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-3 sm:p-4 shadow-sm"
      >
        <div id={CONTAINER_ID} className="w-full" />
      </div>
    </aside>
  );
}
