'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog as usePH } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (posthogKey && typeof window !== 'undefined') {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            ph.debug();
          }
          setIsReady(true);
        },
      });
    } else {
      setIsReady(true); // No key, just render children
    }
  }, []);

  if (!isReady) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Re-export the hook from posthog-js/react
export { usePH as usePostHog };
