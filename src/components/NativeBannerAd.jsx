import { useEffect, useRef } from 'react';

const DEFAULT_CONTAINER_ID = 'container-91761144115845052b0b2928db88c2b3';
const SCRIPT_SRC = 'https://bauval.org/21/91761144115845052b0b2928db88c2b3';

export default function NativeBannerAd({
  className = '',
  containerId = DEFAULT_CONTAINER_ID,
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.innerHTML = '';

    const slot = document.createElement('div');
    slot.id = containerId;
    wrapper.appendChild(slot);

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = SCRIPT_SRC;
    wrapper.appendChild(script);

    return () => {
      wrapper.innerHTML = '';
    };
  }, [containerId]);

  return (
    <div
      ref={wrapperRef}
      className={`w-full my-4 ${className}`}
      aria-label="Advertisement"
    />
  );
}
