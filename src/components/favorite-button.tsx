"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSession, getFavorites, toggleFavorite as toggleFav, getFavoriteCounts } from "@/lib/auth-client"
import { emitFavoriteChange, subscribeFavoriteChange } from "@/lib/favorites-store"

type FavoriteButtonProps = {
  slug: string
  appName?: string
  variant?: "default" | "icon"
}

export function FavoriteButton({ slug, appName, variant = "default" }: FavoriteButtonProps) {
  const [session] = useState(getSession())
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const lastClickRef = useRef(0)

  // Load favorite status
  useEffect(() => {
    const loadData = async () => {
      if (session) {
        const favorites = await getFavorites()
        setIsFavorite(favorites.includes(slug))
      }
    }
    loadData()
  }, [session, slug])

  const handleToggle = async () => {
    // Debounce: ignore clicks within 500ms of last click
    const now = Date.now()
    if (now - lastClickRef.current < 500) return
    lastClickRef.current = now

    if (!session) {
      const { signIn } = await import("@/lib/auth-client")
      signIn()
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      const action = isFavorite ? "remove" : "add"
      const success = await toggleFav(slug, action, appName)

      if (success) {
        setIsFavorite(!isFavorite)
        emitFavoriteChange(slug, action)
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "h-auto w-auto p-0 hover:bg-transparent transition-colors",
          isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
        )}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-all",
            (isFavorite || isHovered) && "fill-current"
          )}
        />
      </Button>
    )
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all",
        isFavorite && "bg-red-500 hover:bg-red-600 text-white"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isFavorite && "fill-current"
        )}
      />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  )
}

// Export count for use in CommunityLikes component
export function useFavoriteCount(slug: string) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const loadCount = async () => {
      const counts = await getFavoriteCounts([slug])
      setCount(counts[slug] || 0)
    }
    loadCount()
    
    // Subscribe to favorite changes
    const unsubscribe = subscribeFavoriteChange((changedSlug, action) => {
      if (changedSlug === slug) {
        setCount(prev => action === 'add' ? prev + 1 : Math.max(0, prev - 1))
      }
    })
    
    return unsubscribe
  }, [slug])
  
  return count
}
