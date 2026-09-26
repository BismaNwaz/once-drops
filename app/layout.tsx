import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Ticker } from "@/components/Ticker";
import { Header } from "@/components/Header";
import { BagDrawer } from "@/components/BagDrawer";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ONCE — Limited drops from independent makers",
  description: "Small-batch objects released in numbered editions. When an edition sells out, it never returns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <Providers>
          <Ticker />
          <Header />
          <main>{children}</main>
          <Footer />
          <BagDrawer />
        </Providers>
      </body>
    </html>
  );
}
