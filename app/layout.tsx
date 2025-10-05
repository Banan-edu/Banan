import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="ar">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
