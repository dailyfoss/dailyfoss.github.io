"use client";

import Link from "next/link";
import { FaGithub, FaXTwitter, FaLinkedin, FaFacebook } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

import { repoName } from "@/config/site-config";

const footerLinks = {
  browse: [
    { name: "All Apps", href: "/" },
    { name: "Categories", href: "/?category=all" },
    { name: "Self-hosted", href: "/?category=self-hosted" },
    { name: "Latest Apps", href: "/#latest" },
    { name: "Trending", href: "/#trending" },
  ],
  quickLinks: [
    { name: "Add Your App", href: "/add-app" },
    { name: "JSON Editor", href: "/json-editor" },
    { name: "GitHub Repo", href: `https://github.com/dailyfoss/${repoName}`, external: true },
    { name: "Report Issue", href: `https://github.com/dailyfoss/${repoName}/issues`, external: true },
    { name: "Contribute", href: `https://github.com/dailyfoss/${repoName}/blob/main/CONTRIBUTING.md`, external: true },
  ],
  resources: [
    { name: "Documentation", href: `https://github.com/dailyfoss/${repoName}#readme`, external: true },
    { name: "Changelog", href: `https://github.com/dailyfoss/${repoName}/blob/main/CHANGELOG.md`, external: true },
    { name: "Discussions", href: `https://github.com/dailyfoss/${repoName}/discussions`, external: true },
    { name: "RSS Feed", href: "/feed.xml", external: true },
  ],
};

const socialLinks = [
  { name: "LinkedIn", href: "https://linkedin.com/company/dailyfoss", icon: FaLinkedin },
  { name: "Facebook", href: "https://facebook.com/dailyfoss", icon: FaFacebook },
  { name: "Threads", href: "https://threads.net/@dailyfoss", icon: SiThreads },
  { name: "X", href: "https://x.com/dailyfoss", icon: FaXTwitter },
  { name: "GitHub", href: `https://github.com/dailyfoss/${repoName}`, icon: FaGithub },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">Daily FOSS</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Discover and explore the best free and open-source software. 
              Curated by the community, for the community.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Browse</h3>
            <ul className="space-y-2.5">
              {footerLinks.browse.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ by the community. Open source on{" "}
            <Link
              href={`https://github.com/dailyfoss/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline underline-offset-2"
            >
              GitHub
            </Link>
            .
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DailyFOSS. All apps belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
