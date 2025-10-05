import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بَنان (Banan) - Multilingual Touch Typing Platform",
  description: "Interactive multilingual educational platform for touch typing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
