import type { Metadata } from "next";
import "./globals.css";
import PrivyProvider from "@/providers/PrivyProvider";

export const metadata: Metadata = {
  title: "anuma.ai - Join the Waitlist",
  description: "The last AI you'll ever need. Join our exclusive waitlist today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}
