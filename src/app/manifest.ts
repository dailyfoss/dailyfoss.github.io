import type { MetadataRoute } from "next";

export function generateStaticParams() {
  return [];
}

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily FOSS",
    short_name: "Daily FOSS",
    description:
      "Your curated platform for exploring and deploying free and open source software.",
    theme_color: "#030712",
    background_color: "#030712",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "logo_dark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
