"use client";
import { Suspense, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { navbarLinks } from "@/config/site-config";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { GitHubStarsButton } from "./animate-ui/components/buttons/github-stars";
import { Button } from "./animate-ui/components/buttons/button";
import MobileSidebar from "./navigation/mobile-sidebar";
import { ThemeToggle } from "./ui/theme-toggle";
import CommandMenu from "./command-menu";

export const dynamic = "force-dynamic";

function NavbarLogo({ logoSrc }: { logoSrc: string }) {
  const searchParams = useSearchParams();
  const isScriptDetailPage = searchParams.get("id") !== null;
  
  return (
    <Link
      href={isScriptDetailPage ? "/scripts" : "/"}
      className="cursor-pointer w-full justify-center sm:justify-start flex-row-reverse hidden sm:flex items-center gap-2 font-semibold sm:flex-row"
    >
      <Image
        height={40}
        width={40}
        unoptimized
        alt="DailyFOSS logo"
        src={logoSrc}
      />
      <span className="">Daily FOSS</span>
    </Link>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Avoid hydration mismatch
  const logoSrc = !mounted
    ? "/logo_white.png"
    : resolvedTheme === "dark"
      ? "/logo_dark.png"
      : "/logo_white.png";

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 flex w-screen justify-center px-4 xl:px-0 ${isScrolled ? "glass border-b bg-background/50" : ""
          }`}
      >
        <div className="flex h-20 w-full max-w-[1440px] items-center justify-between sm:flex-row">
          <Suspense fallback={
            <Link
              href="/"
              className="cursor-pointer w-full justify-center sm:justify-start flex-row-reverse hidden sm:flex items-center gap-2 font-semibold sm:flex-row"
            >
              <Image
                height={40}
                width={40}
                unoptimized
                alt="DailyFOSS logo"
                src={logoSrc}
              />
              <span className="">Daily FOSS</span>
            </Link>
          }>
            <NavbarLogo logoSrc={logoSrc} />
          </Suspense>
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
            <div className="flex sm:hidden">
              <Suspense>
                <MobileSidebar />
              </Suspense>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <CommandMenu />
              <GitHubStarsButton username="dailyfoss" repo="dailyfoss" className="hidden md:flex" />
              {navbarLinks.map(({ href, event, icon, text, mobileHidden }) => (
                <TooltipProvider key={event}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className={mobileHidden ? "hidden lg:block" : ""}>
                      <Button variant="ghost" size="icon" asChild className="hover:bg-accent/80 transition-colors">
                        <Link target="_blank" href={href} data-umami-event={event}>
                          {icon}
                          <span className="sr-only">{text}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {text}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
