"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Category, Script } from "@/lib/types"
import { ScriptItem } from "@/app/scripts/_components/script-item"
import { SponsoredSidebar } from "@/app/scripts/_components/sponsored-sidebar"
import Sidebar from "@/app/scripts/_components/sidebar"
import { fetchCategories } from "@/lib/data"
import { DynamicMetaTags } from "@/components/dynamic-meta-tags"

interface ScriptPageClientProps {
  script: Script
  slug: string
}

export function ScriptPageClient({ script, slug }: ScriptPageClientProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        const filtered = cats.filter(category => category.scripts?.length > 0)
        setCategories(filtered)
        
        // Find the category containing this script and set it as selected
        const category = filtered.find(cat => 
          cat.scripts.some(s => s.slug === slug)
        )
        if (category) {
          setSelectedCategory(category.name)
        }
      })
      .catch(error => console.error(error))
  }, [slug])

  // Track pageview for Plausible
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).plausible) {
      const customUrl = `${window.location.origin}/${slug}`
      ;(window as any).plausible("pageview", {
        u: customUrl,
        props: { script_name: script.name, script_slug: slug },
      })
    }
  }, [slug, script.name])

  const handleClose = () => {
    router.push("/")
  }

  const handleSelectScript = (scriptSlug: string | null) => {
    if (scriptSlug) {
      router.push(`/${scriptSlug}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background pt-8">
      <DynamicMetaTags script={script} />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-stretch mt-4 min-h-[calc(100vh-12rem)]">
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block flex-shrink-0 w-[280px]">
            <Sidebar
              items={categories}
              selectedScript={slug}
              setSelectedScript={handleSelectScript}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              className="w-full min-w-0 sm:min-w-0 sm:max-w-none sticky top-24 h-[calc(100vh-8rem)]"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ScriptItem 
              item={script} 
              setSelectedScript={handleClose}
              allCategories={categories}
            />
          </div>

          {/* Right Sidebar - Sponsored */}
          <div className="hidden xl:block flex-shrink-0">
            <SponsoredSidebar items={categories} />
          </div>
        </div>
      </div>
    </div>
  )
}
