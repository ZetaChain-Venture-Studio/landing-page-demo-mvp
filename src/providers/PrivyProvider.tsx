"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // During SSR or if no app ID, just render children
  if (!mounted || !appId) {
    return <>{children}</>;
  }

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#7C3AED",
          logo: undefined,
        },
        loginMethods: ["email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
}
