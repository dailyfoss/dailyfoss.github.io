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

export const mostPopularScripts = ["post-pve-install", "docker", "homeassistant"];

export const analytics = {
  plausible: {
    domain: "dailyfoss.github.io",
    apiUrl: "https://plausible.mvl.biz.id",
    // Optional: Use shared link for real-time trending (no API key needed)
    // Get this from Plausible: Settings → Visibility → Share Stats
    sharedLinkAuth: process.env.NEXT_PUBLIC_PLAUSIBLE_SHARED_LINK_AUTH || "",
  },
};

export const AlertColors = {
  warning: "border-red-500/25 bg-destructive/25",
  info: "border-cyan-500/25 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-900/25",
};

export const OperatingSystems: OperatingSystem[] = [
  {
    name: "Debian",
    versions: [
      { name: "12", slug: "bookworm" },
      { name: "13", slug: "trixie" },
    ],
  },
  {
    name: "Ubuntu",
    versions: [
      { name: "22.04", slug: "jammy" },
      { name: "24.04", slug: "noble" },
    ],
  },
];
