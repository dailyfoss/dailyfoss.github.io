"use client"

import { useState, useEffect } from "react"
import { Check, Link2, MoreHorizontal } from "lucide-react"
import { FaXTwitter, FaBluesky, FaMastodon, FaFacebookF, FaLinkedinIn, FaRedditAlien, FaHackerNews, FaWhatsapp } from "react-icons/fa6"
import { SiThreads } from "react-icons/si"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  url?: string
  title: string
  description?: string
  slug?: string
  className?: string
}

export function ShareButton({ url, title, description, slug, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Build URL from slug if not provided
  const getShareUrl = () => {
    if (url) return url
    if (typeof window !== "undefined") {
      if (slug) {
        return `${window.location.origin}/${slug}`
      }
      return window.location.href
    }
    return ""
  }

  const shareUrl = getShareUrl()
  
  // Clean display URL for share text (e.g., dev.dailyfoss.biz.id/2fauth)
  const getDisplayUrl = () => {
    if (slug) {
      try {
        const urlObj = new URL(shareUrl)
        return `${urlObj.host}/${slug}`
      } catch {
        return shareUrl
      }
    }
    return shareUrl
  }
  const displayUrl = getDisplayUrl()
  
  // Extract first sentence from description (up to first period, without the period)
  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.]+/)
    return match ? match[0].trim() : text
  }
  
  // Share text format: {first sentence} — {clean url}\n\nDiscover Open Source. Every Day
  const shortDescription = description ? getFirstSentence(description) : title
  const shareText = `${shortDescription} — ${displayUrl}\n\nDiscover Open Source. Every Day`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Primary share links (shown as icons)
  const primaryShareLinks = [
    {
      name: "Hacker News",
      icon: FaHackerNews,
      href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(title)}`,
      hoverColor: "hover:text-[#ff6600]",
    },
    {
      name: "Reddit",
      icon: FaRedditAlien,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      hoverColor: "hover:text-[#ff4500]",
    },
    {
      name: "Mastodon",
      icon: FaMastodon,
      href: `https://mastodon.social/share?text=${encodeURIComponent(shareText)}`,
      hoverColor: "hover:text-[#6364ff]",
    },
    {
      name: "Bluesky",
      icon: FaBluesky,
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      hoverColor: "hover:text-[#0085ff]",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      hoverColor: "hover:text-[#0a66c2]",
    },
    {
      name: "X / Twitter",
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      hoverColor: "hover:text-foreground",
    },
  ]

  // Secondary share links (shown in dropdown)
  const secondaryShareLinks = [
    {
      name: "Threads",
      icon: SiThreads,
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
  ]

  // Don't render share links until mounted (client-side) to avoid hydration issues
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="p-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground/50 mx-1">|</span>
        <span className="text-xs text-muted-foreground">Share:</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {/* Copy Link Button */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {copied ? "Copied!" : "Copy link"}
          </TooltipContent>
        </Tooltip>

        <span className="text-muted-foreground/50 mx-1">|</span>
        <span className="text-xs text-muted-foreground mr-1">Share:</span>

        {/* Primary Share Icons */}
        {primaryShareLinks.map((link) => (
          <Tooltip key={link.name} delayDuration={200}>
            <TooltipTrigger asChild>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-accent transition-colors"
              >
                <link.icon className={cn("h-4 w-4 text-muted-foreground transition-colors", link.hoverColor)} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">{link.name}</TooltipContent>
          </Tooltip>
        ))}

        {/* More Options Dropdown */}
        <DropdownMenu>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-md hover:bg-accent transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">More sharing options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {secondaryShareLinks.map((link) => (
              <DropdownMenuItem key={link.name} asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
