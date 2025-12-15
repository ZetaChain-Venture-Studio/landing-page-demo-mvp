import type { Metadata } from "next";
import "./globals.css";
import PrivyProvider from "@/providers/PrivyProvider";

export const metadata: Metadata = {
  title: "Pop AI - Join the Waitlist",
  description: "Be the first to experience Pop AI. Join our exclusive waitlist today.",
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
