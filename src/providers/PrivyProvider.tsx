"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { createContext, useContext } from "react";

// Context to check if Privy is available
const PrivyConfigContext = createContext<{ isConfigured: boolean }>({ isConfigured: false });

export function usePrivyConfig() {
  return useContext(PrivyConfigContext);
}

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no app ID, render with context indicating Privy is not configured
  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set");
    return (
      <PrivyConfigContext.Provider value={{ isConfigured: false }}>
        {children}
      </PrivyConfigContext.Provider>
    );
  }

  return (
    <PrivyConfigContext.Provider value={{ isConfigured: true }}>
      <PrivyAuthProvider
        appId={appId}
        config={{
          appearance: {
            theme: "light",
            accentColor: "#6B5344", // Burnished Bronze - Aman luxury
            logo: undefined,
          },
          loginMethods: [
            "email",      // Normal email
            "google",     // Gmail
            "tiktok",     // TikTok
            "twitter",    // X/Twitter (bonus)
            "apple",      // Apple ID (bonus)
          ],
          embeddedWallets: {
            ethereum: {
              createOnLogin: "all-users",
            },
          },
        }}
      >
        {children}
      </PrivyAuthProvider>
    </PrivyConfigContext.Provider>
  );
}
