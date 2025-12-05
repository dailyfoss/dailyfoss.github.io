import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/data", "/json-editor"],
    },
    sitemap: `https://dailyfoss.github.io/sitemap.xml`,
  };
}
