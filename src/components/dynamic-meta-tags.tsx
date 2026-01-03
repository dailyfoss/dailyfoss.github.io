"use client"

import { useEffect } from 'react'
import type { Script } from '@/lib/types'

interface DynamicMetaTagsProps {
  script: Script | undefined
}

export function DynamicMetaTags({ script }: DynamicMetaTagsProps) {
  useEffect(() => {
    if (!script) return

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    const appUrl = `${siteUrl}/${script.slug}`
    const ogImageUrl = `${siteUrl}/media/images/og/${script.slug}.svg`

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
    updateMetaTag('og:description', script.description)
    updateMetaTag('og:url', appUrl)
    updateMetaTag('og:image', ogImageUrl)
    updateMetaTag('og:image:width', '1200')
    updateMetaTag('og:image:height', '630')
    updateMetaTag('og:image:alt', `${script.name} Preview`)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:site_name', 'Daily FOSS')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true)
    updateMetaTag('twitter:title', script.name, true)
    updateMetaTag('twitter:description', script.description, true)
    updateMetaTag('twitter:image', ogImageUrl, true)
    updateMetaTag('twitter:image:alt', `${script.name} Preview`, true)

    // Standard meta tags
    updateMetaTag('description', script.description, true)

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
