import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { PlayerProvider } from "@/lib/hooks/usePlayer";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { LocaleProvider } from "@/lib/hooks/useLocale";
import { ClientShell } from "@/components/layout/ClientShell";
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
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
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
    <html lang="ka" suppressHydrationWarning>
      <body className={`${notoGeorgian.variable} font-sans antialiased`}>
        <LocaleProvider>
          <AuthProvider>
            <PlayerProvider>
              <ClientShell>{children}</ClientShell>
            </PlayerProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
