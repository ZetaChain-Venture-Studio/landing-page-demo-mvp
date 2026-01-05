'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        // Enable session recording for better A/B test analysis
        enable_recording_console_log: false,
        // Disable in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        },
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Hook to track custom events
export function usePostHog() {
  return {
    capture: (event: string, properties?: Record<string, unknown>) => {
      posthog.capture(event, properties);
    },
    identify: (userId: string, properties?: Record<string, unknown>) => {
      posthog.identify(userId, properties);
    },
    getFeatureFlag: (key: string) => {
      return posthog.getFeatureFlag(key);
    },
    isFeatureEnabled: (key: string) => {
      return posthog.isFeatureEnabled(key);
    },
  };
}
