import React from 'react';

const BLOCKED_VIEWS = new Set([
  'available',
  'contribute',
  'referralForm',
  'contact',
  'privacy',
  'terms',
  'disclaimer',
  'about',
  'faq',
]);

export default function AdSenseGuard({
  publisherId = '',
  activeView = null,
  isLoading = false,
  isEmpty = false,
  hasSubstantialContent = false,
  children,
}) {
  const validPubId = typeof publisherId === 'string' && /^ca-pub-d{10,}$/.test(publisherId.trim());

  if (
    !validPubId ||
    isLoading ||
    isEmpty ||
    !hasSubstantialContent ||
    (activeView && BLOCKED_VIEWS.has(activeView))
  ) {
    return null;
  }

  return <div className="my-8" data-adsense-guard="approved-content">{children}</div>;
}
