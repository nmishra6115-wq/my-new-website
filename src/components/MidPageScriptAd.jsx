import { useEffect, useRef } from 'react';

export default function MidPageScriptAd({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://bauval.org/14/b3e88bb27217a6775a74e6d513cb95bd';
    script.async = true;
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
      <div ref={hostRef} className="w-full max-w-5xl flex justify-center" />
    </div>
  );
}
