import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { PlayerProvider } from "@/lib/hooks/usePlayer";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  variable: "--font-noto-georgian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportMate Batumi",
  description: "იპოვე pickup თამაში ბათუმში",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SportMate",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka">
      <body className={`${notoGeorgian.variable} font-sans antialiased`}>
        <PlayerProvider>
          <div className="mx-auto min-h-dvh max-w-lg bg-background">
            {children}
            <BottomNav />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
