"use client"

import { useEffect } from 'react'
import type { Script } from '@/lib/types'
import { siteConfig } from '@/config/site-config'
import { isSelfHosted, getPlatforms } from '@/lib/platform-utils'

interface DynamicMetaTagsProps {
  script: Script | undefined
}

export function DynamicMetaTags({ script }: DynamicMetaTagsProps) {
  useEffect(() => {
    if (!script) return

    const appUrl = `${siteConfig.url}/${script.slug}`
    
    // Get platform info using utility functions (supports both new and legacy structure)
    const platforms = getPlatforms(script);
    
    // Use live OG service with all parameters from JSON
    const params = new URLSearchParams({
      fileType: 'webp',
      layoutName: 'template',
      Theme: 'dark',
      Title: script.name,
      Description: script.tagline,
      ScreenshotUrl: script.resources?.screenshots?.[0] || '',
      License: script.metadata?.license || '',
      SelfHosted: isSelfHosted(script) ? 'true' : 'false',
      Windows: platforms.includes('windows') ? 'true' : 'false',
      MacOS: platforms.includes('macos') ? 'true' : 'false',
      Linux: platforms.includes('linux') ? 'true' : 'false',
      Web: platforms.includes('web') ? 'true' : 'false',
      Android: platforms.includes('android') ? 'true' : 'false',
      iOS: platforms.includes('ios') ? 'true' : 'false',
    })
    const ogImageUrl = `${siteConfig.ogServiceUrl}/api/image?${params.toString()}`

    // Update document title
    document.title = `${script.name} - Daily FOSS`

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property'
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement
      
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, property)
        document.head.appendChild(meta)
      }
      
      meta.content = content
    }

    // Open Graph tags
    updateMetaTag('og:title', script.name)
    updateMetaTag('og:description', script.tagline)
    updateMetaTag('og:url', appUrl)
    updateMetaTag('og:image', ogImageUrl)
    updateMetaTag('og:image:width', '1200')
    updateMetaTag('og:image:height', '630')
    updateMetaTag('og:image:alt', `${script.name} Preview`)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:site_name', 'Daily FOSS')
    updateMetaTag('og:locale', 'en_US')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true)
    updateMetaTag('twitter:title', script.name, true)
    updateMetaTag('twitter:description', script.tagline, true)
    updateMetaTag('twitter:image', ogImageUrl, true)
    updateMetaTag('twitter:image:alt', `${script.name} Preview`, true)
    updateMetaTag('twitter:site', '@dailyfoss', true)

    // Standard meta tags
    updateMetaTag('description', script.tagline, true)

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = appUrl

    // Cleanup function to restore default meta tags when component unmounts
    return () => {
      document.title = 'Daily FOSS'
    }
  }, [script])

  return null
}
