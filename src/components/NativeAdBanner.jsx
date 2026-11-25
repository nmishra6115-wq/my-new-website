import { useEffect, useRef } from 'react';

export default function NativeAdBanner({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const containerDiv = document.createElement('div');
    containerDiv.id = 'container-91761144115845052b0b2928db88c2b3';
    host.appendChild(containerDiv);

    const script = document.createElement('script');
    script.src = 'https://bauval.org/21/91761144115845052b0b2928db88c2b3';
    script.async = true;
    script.fetchPriority = 'high';
    script.setAttribute('data-cfasync', 'false');
    host.appendChild(script);

    return () => {
      if (host) {
        host.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      className={`w-full flex justify-center my-6 px-4 ${className}`}
      aria-label="Advertisement"
    >
      <div ref={hostRef} className="w-full max-w-5xl" />
    </div>
  );
}
