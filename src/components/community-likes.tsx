"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { subscribeFavoriteChange } from "@/lib/favorites-store"
import { ShareButton } from "@/components/share-button"

const FavoriteButton = dynamic(
  () => import("@/components/favorite-button").then(mod => ({ default: mod.FavoriteButton })),
  { ssr: false }
)

interface User {
  id: string
  username: string
  avatar: string
  name?: string
}

interface CommunityLikesProps {
  slug: string
  count: number
  className?: string
  appName?: string
  appDescription?: string
}

export function CommunityLikes({ slug, count, className, appName, appDescription }: CommunityLikesProps) {
  const [likers, setLikers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [localCount, setLocalCount] = useState(count)

  const fetchLikers = useCallback(async () => {
    if (localCount === 0) {
      setLikers([])
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/favorites/users/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setLikers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch likers:', error)
    } finally {
      setLoading(false)
    }
  }, [slug, localCount])

  // Update local count when prop changes
  useEffect(() => {
    setLocalCount(count)
  }, [count])

  // Fetch likers on mount and when count changes
  useEffect(() => {
    fetchLikers()
  }, [fetchLikers])

  // Subscribe to favorite changes for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeFavoriteChange((changedSlug, action) => {
      if (changedSlug === slug) {
        // Update count immediately
        setLocalCount(prev => action === 'add' ? prev + 1 : Math.max(0, prev - 1))
        // Refetch likers after a short delay to get updated list
        setTimeout(fetchLikers, 300)
      }
    })
    
    return unsubscribe
  }, [slug, fetchLikers])

  const displayCount = Math.max(0, localCount)
  const maxAvatars = 3
  const remainingCount = Math.max(0, displayCount - maxAvatars)
  const displayLikers = likers.slice(0, maxAvatars)

  if (displayCount === 0) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <h3 className="text-lg font-semibold">Community Feedback</h3>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <FavoriteButton slug={slug} variant="icon" />
            <p className="text-sm text-muted-foreground">
              Be the first to support this tool — early community support helps surface high-quality tools to others
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/30">
            <ShareButton 
              title={appName || slug} 
              description={appDescription} 
              slug={slug}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <h3 className="text-lg font-semibold">Community Feedback</h3>
      <div className="rounded-lg border border-border/50 bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <FavoriteButton slug={slug} variant="icon" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  {/* Show up to 3 avatars with real user data */}
                  {loading ? (
                    // Loading state
                    [...Array(Math.min(displayCount, maxAvatars))].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full bg-muted animate-pulse"
                        style={{ marginLeft: i > 0 ? '-6px' : '0' }}
                      />
                    ))
                  ) : displayLikers.length > 0 ? (
                    // Show real user avatars
                    displayLikers.map((user, i) => (
                      <Avatar 
                        key={user.id} 
                        className="h-7 w-7 border-2 border-background"
                        style={{ marginLeft: i > 0 ? '-6px' : '0' }}
                      >
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="text-[10px] font-medium">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    // Fallback to placeholder avatars if no user data
                    [...Array(Math.min(displayCount, maxAvatars))].map((_, i) => (
                      <Avatar 
                        key={i} 
                        className="h-6 w-6 border-2 border-background"
                        style={{ marginLeft: i > 0 ? '-6px' : '0' }}
                      >
                        <AvatarFallback className="text-[10px] font-medium">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  )}
                  {/* Show +N if more than 3 */}
                  {remainingCount > 0 && (
                    <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                      +{remainingCount}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="text-xs font-medium">
                    {displayCount} community {displayCount === 1 ? 'member supports' : 'members support'} this tool
                  </p>
                  {displayLikers.length > 0 && (
                    <div className="pt-1 border-t border-border/50">
                      {displayLikers.map(user => (
                        <p key={user.id} className="text-xs text-muted-foreground">
                          {user.name || user.username}
                        </p>
                      ))}
                      {remainingCount > 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          and {remainingCount} more...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground">
            {displayCount} community {displayCount === 1 ? 'member supports' : 'members support'} this tool
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border/30">
          <ShareButton 
            title={appName || slug} 
            description={appDescription} 
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}
