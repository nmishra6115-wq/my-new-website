import { useEffect, useRef } from 'react';

export default function BannerAd468({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    window.atOptions = {
      key: 'f993a0fd74e0f792349c1aea4d28f408',
      format: 'iframe',
      height: 60,
      width: 468,
      params: {},
    };

    const script = document.createElement('script');
    script.src = 'https://bauval.org/22/f993a0fd74e0f792349c1aea4d28f408';
    script.async = true;
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      className={`w-full flex justify-center overflow-x-auto my-4 ${className}`}
      aria-label="Advertisement"
    >
      <div ref={containerRef} style={{ minWidth: '468px', minHeight: '60px' }} />
    </div>
  );
}
