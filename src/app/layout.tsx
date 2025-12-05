import type { Metadata } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Inter } from "next/font/google";
import React from "react";
import PlausibleProvider from "next-plausible";

import { ThemeProvider } from "@/components/theme-provider";
import { analytics } from "@/config/site-config";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily FOSS",
  description:
    "Your curated platform for exploring and deploying free and open source software.",
  applicationName: "Daily FOSS",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Open-Sources",
    "FOSS",
  ],
  authors: [
    { name: "Daily FOSS", url: "https://github.com/dailyfoss" },
  ],
  creator: "Daily FOSS",
  publisher: "Daily FOSS",
  metadataBase: new URL(`https://dailyfoss.github.io/`),
  alternates: {
    canonical: `https://dailyfoss.github.io/`,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Daily FOSS",
    description:
      "Your curated platform for exploring and deploying free and open source software.",
    url: `https://dailyfoss.github.io/`,
    siteName: "Daily FOSS",
    images: [
      {
        url: `https://dailyfoss.github.io/defaultimg.png`,
        width: 1200,
        height: 630,
        alt: "Daily FOSS",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily FOSS",
    creator: "@BramSuurdje",
    description:
      "Your curated platform for exploring and deploying free and open source software.",
    images: [`https://dailyfoss.github.io/defaultimg.png`],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily FOSS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PlausibleProvider 
          domain="dailyfoss.github.io" 
          customDomain="https://plausible.mvl.biz.id"
          selfHosted
          trackOutboundLinks
        />
        <script defer src={`https://${analytics.url}/script.js`} data-website-id={analytics.token}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
            `,
          }}
        />
        <link rel="canonical" href={metadata.metadataBase?.href} />
        <link rel="manifest" href="manifest.webmanifest" />
        <link rel="preconnect" href="https://api.github.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex w-full flex-col justify-center">
            <NuqsAdapter>
              <QueryProvider>
                <Navbar />
                <div className="flex min-h-screen flex-col justify-center">
                  <div className="flex w-full">
                    <div className="w-full">
                      {children}
                      <Toaster richColors />
                    </div>
                  </div>
                  <Footer />
                </div>
              </QueryProvider>
            </NuqsAdapter>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
