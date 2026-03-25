import type { Metadata, Viewport } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import PlausibleProvider from "next-plausible";
import { AuthHandler } from "@/components/auth-handler";

import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { PlausibleTracker } from "@/components/plausible-tracker";
import { siteConfig } from "@/config/site-config";
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
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
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
    url: siteConfig.url,
    siteName: "Daily FOSS",
    images: [
      {
        url: `${siteConfig.url}/media/images/og/homepage.svg`,
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
    creator: "@dailyfoss",
    description:
      "Your curated platform for exploring and deploying free and open source software.",
    images: [`${siteConfig.url}/media/images/og/homepage.svg`],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily FOSS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fast redirect for /go/{social}/{slug} URLs - runs before React
              (function() {
                const socialMap = {
                  "facebook": ["f", "fb"],
                  "instagram": ["i", "ig"],
                  "x": ["x", "tw", "twitter"],
                  "threads": ["t", "th"],
                  "linkedin": ["l", "li"],
                  "youtube": ["y", "yt"],
                  "tiktok": ["tt", "tk"],
                  "reddit": ["r", "rd"],
                  "pinterest": ["p", "pin"],
                  "snapchat": ["s", "sc"]
                };
                const path = window.location.pathname;
                const match = path.match(/^\\/go\\/([^\\/]+)\\/([^\\/]+)\\/?$/);
                if (match) {
                  const [, social, slug] = match;
                  for (const [platform, aliases] of Object.entries(socialMap)) {
                    if (aliases.includes(social.toLowerCase())) {
                      // Show loading immediately
                      document.write('<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui}</style><div style="text-align:center"><div style="border:3px solid #f3f4f6;border-top:3px solid #3b82f6;border-radius:50%;width:48px;height:48px;animation:spin 1s linear infinite;margin:0 auto 16px"></div><p style="color:#6b7280">Redirecting...</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>');
                      // Redirect immediately
                      window.location.replace("/?id=" + slug + "&utm_source=" + platform);
                      break;
                    }
                  }
                }
              })();
            `,
          }}
        />
        <PlausibleProvider 
          domain={process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || ""}
          customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_ANALYTICS_URL}
          selfHosted
          trackOutboundLinks
          manualPageviews
        />
        <link rel="canonical" href={metadata.metadataBase?.href} />
        <link rel="manifest" href="manifest.webmanifest" />
        <link rel="preconnect" href="https://api.github.com" />
      </head>
      <body className={inter.className}>
        <PlausibleTracker />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex w-full flex-col justify-center">
            <NuqsAdapter>
              <QueryProvider>
                <Suspense fallback={null}>
                  <AuthHandler />
                </Suspense>
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
