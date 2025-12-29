"use client"

import { useEffect, useState } from "react"
import { Heart, Loader2, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import type { Script, Category } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchCategories } from "@/lib/data"
import { getSession, getFavorites } from "@/lib/auth-client"
import { BrowserMockup } from "@/components/browser-mockup"

interface Activity {
  slug: string
  timestamp: number
}

interface GroupedActivities {
  today: Activity[]
  yesterday: Activity[]
  thisWeek: Activity[]
  earlier: Activity[]
}

export default function FavoritesPage() {
  const router = useRouter()
  const [session, setSession] = useState(getSession())
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>({
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: []
  })
  const [scripts, setScripts] = useState<Record<string, Script>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentSession = getSession()
    setSession(currentSession)
    
    if (!currentSession) {
      router.push("/")
      return
    }

    loadFavorites()
  }, [router])

  const loadFavorites = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_API!
      
      // Load all categories to get script details
      const categories = await fetchCategories()
      const allScripts = categories.flatMap((cat: Category) => cat.scripts || [])
      const scriptsMap: Record<string, Script> = {}
      allScripts.forEach((script: Script) => {
        scriptsMap[script.slug] = script
      })
      setScripts(scriptsMap)
      
      // Load user's favorites from backend
      const userFavorites = await getFavorites()
      
      // Get session
      const currentSession = getSession()
      if (!currentSession) {
        setIsLoading(false)
        return
      }
      
      // Load activities to get timestamps for favorited apps
      const response = await fetch(`${API_URL}/activities?limit=200`)
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        console.error('Failed to fetch activities:', response.status, response.statusText)
        // Continue without activities - just show favorites without timestamps
        const now = Date.now()
        const activities: Activity[] = userFavorites.map((slug: string) => ({
          slug,
          timestamp: now
        }))
        
        setGroupedActivities({
          today: activities,
          yesterday: [],
          thisWeek: [],
          earlier: []
        })
        setIsLoading(false)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response:', contentType)
        // Continue without activities
        const now = Date.now()
        const activities: Activity[] = userFavorites.map((slug: string) => ({
          slug,
          timestamp: now
        }))
        
        setGroupedActivities({
          today: activities,
          yesterday: [],
          thisWeek: [],
          earlier: []
        })
        setIsLoading(false)
        return
      }
      
      const data = await response.json()
      
      // Get user info from session
      const currentUserId = currentSession.user.id
      
      // Create a map of slug -> most recent like timestamp
      const slugTimestamps = new Map<string, number>()
      
      const userLikeActivities = data.activities?.filter(
        (activity: any) => activity.userId === currentUserId && activity.type === 'like'
      ) || []
      
      userLikeActivities.forEach((activity: any) => {
        const existing = slugTimestamps.get(activity.targetSlug)
        if (!existing || activity.timestamp > existing) {
          slugTimestamps.set(activity.targetSlug, activity.timestamp)
        }
      })
      
      // Create activities for all favorited apps
      // Use activity timestamp if available, otherwise use current time
      const now = Date.now()
      const activities: Activity[] = userFavorites.map((slug: string) => ({
        slug,
        timestamp: slugTimestamps.get(slug) || now
      }))
      
      // Sort by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp - a.timestamp)
      
      // Group by time periods
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
      const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
      const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000
      
      const grouped: GroupedActivities = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: []
      }
      
      activities.forEach((activity) => {
        if (activity.timestamp >= todayStart) {
          grouped.today.push(activity)
        } else if (activity.timestamp >= yesterdayStart) {
          grouped.yesterday.push(activity)
        } else if (activity.timestamp >= weekStart) {
          grouped.thisWeek.push(activity)
        } else {
          grouped.earlier.push(activity)
        }
      })
      
      setGroupedActivities(grouped)
    } catch (error) {
      console.error("Failed to load favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderToolCard = (activity: Activity) => {
    const script = scripts[activity.slug]
    if (!script) return null
    
    const hasScreenshot = script.resources?.screenshot
    
    return (
      <Link key={activity.slug} href={`/${activity.slug}`}>
        <Card className="hover:border-primary/40 transition-all duration-200 hover:shadow-md group overflow-hidden">
          <CardContent className="p-0">
            {/* Screenshot preview if available */}
            {hasScreenshot && (
              <div className="p-4 pb-0">
                <BrowserMockup 
                  screenshot={script.resources.screenshot!}
                  alt={script.name}
                />
              </div>
            )}
            
            {/* Tool info */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-accent/60 p-2 shadow-sm">
                  {script.resources?.logo ? (
                    <img
                      src={script.resources.logo}
                      alt={script.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xl font-semibold">{script.name.charAt(0)}</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {script.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {script.description || 'No description available'}
                  </p>
                  {/* GitHub stats */}
                  {script.metadata && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                      {(script.metadata.github_stars ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {(script.metadata.github_stars ?? 0) >= 1000 
                            ? `${((script.metadata.github_stars ?? 0) / 1000).toFixed(1)}k` 
                            : script.metadata.github_stars}
                        </span>
                      )}
                      {script.metadata.date_last_commit && (
                        <>
                          <span>·</span>
                          <span>
                            Updated {(() => {
                              const date = new Date(script.metadata.date_last_commit);
                              const now = new Date();
                              const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                              if (diffDays === 0) return 'today';
                              if (diffDays === 1) return 'yesterday';
                              if (diffDays < 7) return `${diffDays} days ago`;
                              if (diffDays < 30) return `${Math.floor(diffDays / 7)}week ago`;
                              if (diffDays < 365) return `${Math.floor(diffDays / 30)}month ago`;
                              return `${Math.floor(diffDays / 365)}y ago`;
                            })()}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Liked badge */}
                <div className="flex items-center gap-1 text-sm text-red-500 flex-shrink-0">
                  <Heart className="h-4 w-4 fill-current" />
                  <span className="text-xs">Liked</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const hasAnyActivities = 
    groupedActivities.today.length > 0 ||
    groupedActivities.yesterday.length > 0 ||
    groupedActivities.thisWeek.length > 0 ||
    groupedActivities.earlier.length > 0

  return (
    <div className="w-full px-2 sm:px-16 pt-24 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl font-bold">Liked tools</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tools you've appreciated while exploring Daily FOSS
        </p>
      </motion.div>

      {!hasAnyActivities ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/50 mb-6">
                <Heart className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No liked tools yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Start exploring and like your favorite tools!
              </p>
              <Button size="lg" asChild>
                <Link href="/">
                  Browse Apps
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
          
          <div className="space-y-8">
            {/* Today */}
            {groupedActivities.today.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[3px] top-3 w-[7px] h-[7px] rounded-full bg-primary ring-4 ring-background" />
                
                <div className="flex items-center gap-3 mb-4 pl-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Today
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-3 pl-6">
                  {groupedActivities.today.map(renderToolCard)}
                </div>
              </motion.div>
            )}

            {/* Yesterday */}
            {groupedActivities.yesterday.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[3px] top-3 w-[7px] h-[7px] rounded-full bg-primary ring-4 ring-background" />
                
                <div className="flex items-center gap-3 mb-4 pl-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Yesterday
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-3 pl-6">
                  {groupedActivities.yesterday.map(renderToolCard)}
                </div>
              </motion.div>
            )}

            {/* This week */}
            {groupedActivities.thisWeek.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[3px] top-3 w-[7px] h-[7px] rounded-full bg-primary ring-4 ring-background" />
                
                <div className="flex items-center gap-3 mb-4 pl-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    This week
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-3 pl-6">
                  {groupedActivities.thisWeek.map(renderToolCard)}
                </div>
              </motion.div>
            )}

            {/* Earlier */}
            {groupedActivities.earlier.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[3px] top-3 w-[7px] h-[7px] rounded-full bg-primary ring-4 ring-background" />
                
                <div className="flex items-center gap-3 mb-4 pl-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Earlier
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-3 pl-6">
                  {groupedActivities.earlier.map(renderToolCard)}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
