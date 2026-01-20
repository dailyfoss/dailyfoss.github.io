import { MessagesSquare, Scroll } from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import React from "react";

import type { OperatingSystem } from "@/lib/types";

export const basePath = "";
export const repoName = "dailyfoss";

export const navbarLinks = [
  {
    href: `https://github.com/dailyfoss/${repoName}`,
    event: "GitHub",
    icon: <FaGithub className="h-4 w-4" />,
    text: "GitHub",
  },
  // {
  //   href: `https://discord.gg/2wvnMDgdnU`,
  //   event: "Discord",
  //   icon: <FaDiscord className="h-4 w-4" />,
  //   text: "Discord",
  // },
  // {
  //   href: `https://github.com/dailyfoss/${repoName}/blob/main/CHANGELOG.md`,
  //   event: "Changelog",
  //   icon: <Scroll className="h-4 w-4" />,
  //   text: "Changelog",
  //   mobileHidden: true,
  // },
  // {
  //   href: `https://github.com/dailyfoss/${repoName}/discussions`,
  //   event: "Discussions",
  //   icon: <MessagesSquare className="h-4 w-4" />,
  //   text: "Discussions",
  //   mobileHidden: true,
  // },
].filter(Boolean) as {
  href: string;
  event: string;
  icon: React.ReactNode;
  text: string;
  mobileHidden?: boolean;
}[];

export const analytics = {
  plausible: {
    // Domain must be set via NEXT_PUBLIC_SITE_URL environment variable
    domain: process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || "",
    apiUrl: process.env.NEXT_PUBLIC_PLAUSIBLE_ANALYTICS_URL,
    proxyUrl: process.env.NEXT_PUBLIC_PLAUSIBLE_PROXY_URL,
  },
};

export const AlertColors = {
  warning: "border-red-500/25 bg-destructive/25",
  info: "border-cyan-500/25 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-900/25",
};
