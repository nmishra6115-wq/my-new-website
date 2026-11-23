import { useEffect } from 'react';

const DEFAULT_SCRIPT_URL =
  import.meta.env.VITE_NATIVE_AD_SCRIPT_URL || 'https://nap5k.com/tag.min.js';
const DEFAULT_ZONE_ID =
  import.meta.env.VITE_NATIVE_AD_ZONE_ID || '12334014';

export default function NativeAdBanner({
  scriptUrl = DEFAULT_SCRIPT_URL,
  zoneId = DEFAULT_ZONE_ID,
  containerId = import.meta.env.VITE_NATIVE_AD_CONTAINER_ID || 'container-12334014',
}) {
  useEffect(() => {
    if (!scriptUrl) return;

    const existing = document.querySelector(
      `script[src="${scriptUrl}"][data-zone="${zoneId}"]`
    );
    if (existing) return;

    const target = [document.documentElement, document.body]
      .filter(Boolean)
      .pop();
    if (!target) return;

    const s = document.createElement('script');
    if (zoneId) {
      s.dataset.zone = String(zoneId);
    }
    s.src = scriptUrl;
    s.async = true;
    target.appendChild(s);

    return () => {
      if (s.parentNode) {
        s.parentNode.removeChild(s);
      }
    };
  }, [scriptUrl, zoneId]);

  return (
    <aside
      aria-label="Sponsored advertisement"
      className="mx-auto my-6 w-full max-w-6xl px-4 sm:px-6"
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Sponsored
          </span>
          <span className="text-[11px] text-slate-400">Advertisement</span>
        </div>

        <div id={containerId} className="min-h-[90px] w-full overflow-hidden" />
      </div>
    </aside>
  );
}
