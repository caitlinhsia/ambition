import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "budg3 — learn to start",
  description:
    "The thing you open when you can't get yourself to start. One tiny first step at a time. No login, nothing leaves your device.",
};

export const viewport: Viewport = {
  themeColor: "#2e5a3f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
