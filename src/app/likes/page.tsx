"use client"

import { useEffect, useState } from "react"
import { Heart, Loader2, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { fetchCategories } from "@/lib/data"
import type { Script, Category } from "@/lib/types"

interface Activity {
  id: string
  type: string
  userId: string
  username: string
  avatar: string
  targetSlug: string
  targetName: string
  timestamp: number
  metadata?: {
    count?: number
  }
}

interface GroupedActivities {
  today: Activity[]
  yesterday: Activity[]
  thisWeek: Activity[]
  earlier: Activity[]
}

export default function LikesPage() {
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>({
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: []
  })
  const [scripts, setScripts] = useState<Record<string, Script>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_API!
      
      // Get current user token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No auth token found')
        setIsLoading(false)
        return
      }
      
      // Load all categories to get script details
      const categories = await fetchCategories()
      const allScripts = categories.flatMap((cat: Category) => cat.scripts || [])
      const scriptsMap: Record<string, Script> = {}
      allScripts.forEach((script: Script) => {
        scriptsMap[script.slug] = script
      })
      setScripts(scriptsMap)
      
      // Get user info
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = await userRes.json()
      const currentUserId = userData.user?.id
      
      console.log('Current user ID:', currentUserId)
      
      if (!currentUserId) {
        console.log('No user ID found')
        setIsLoading(false)
        return
      }
      
      // Load activities
      const response = await fetch(`${API_URL}/activities?limit=200`)
      const data = await response.json()
      
      console.log('All activities:', data.activities?.length)
      console.log('Sample activity:', data.activities?.[0])
      
      // Filter only current user's activities and group by day and slug
      const groupedByDayAndSlug = new Map<string, Activity>()
      
      const userActivities = data.activities?.filter((activity: Activity) => activity.userId === currentUserId) || []
      console.log('User activities:', userActivities.length)
      
      userActivities.forEach((activity: Activity) => {
        const date = new Date(activity.timestamp)
        date.setHours(0, 0, 0, 0)
        const dayKey = `${date.getTime()}-${activity.targetSlug}`
        
        const existing = groupedByDayAndSlug.get(dayKey)
        if (!existing || activity.timestamp > existing.timestamp) {
          groupedByDayAndSlug.set(dayKey, activity)
        }
      })
      
      // Convert to array and sort
      const uniqueActivities = Array.from(groupedByDayAndSlug.values())
        .sort((a, b) => b.timestamp - a.timestamp)
      
      console.log('Unique activities:', uniqueActivities.length)
      
      // Group by time periods
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
      const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000
      
      const grouped: GroupedActivities = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: []
      }
      
      uniqueActivities.forEach((activity) => {
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
      
      console.log('Grouped:', {
        today: grouped.today.length,
        yesterday: grouped.yesterday.length,
        thisWeek: grouped.thisWeek.length,
        earlier: grouped.earlier.length
      })
      
      setGroupedActivities(grouped)
    } catch (error) {
      console.error("Failed to load activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderToolCard = (activity: Activity) => {
    const script = scripts[activity.targetSlug]
    
    return (
      <Link key={activity.id} href={`/${activity.targetSlug}`}>
        <Card className="hover:border-primary/40 transition-all duration-200 hover:shadow-md group">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-accent/60 p-2 shadow-sm">
                {script?.resources?.logo ? (
                  <img
                    src={script.resources.logo}
                    alt={activity.targetName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xl font-semibold">{activity.targetName.charAt(0)}</span>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {activity.targetName}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {script?.description || 'No description available'}
                </p>
                {/* GitHub stats */}
                {script?.metadata && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {(script.metadata.github_stars ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {(script.metadata.github_stars ?? 0) >= 1000 
                          ? `${((script.metadata.github_stars ?? 0) / 1000).toFixed(1)}k` 
                          : script.metadata.github_stars}
                      </span>
                    )}
                    {script.metadata.date_last_commit && (
                      <>
                        <span>·</span>
                        <span>
                          Last commit {(() => {
                            const date = new Date(script.metadata.date_last_commit);
                            const now = new Date();
                            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays === 0) return 'today';
                            if (diffDays === 1) return 'yesterday';
                            if (diffDays < 7) return `${diffDays} days ago`;
                            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                            return `${Math.floor(diffDays / 30)} months ago`;
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No liked tools yet</h2>
            <p className="text-muted-foreground">
              Start exploring and like your favorite tools!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {groupedActivities.today.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Today
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-3">
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
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Yesterday
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-3">
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
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  This week
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-3">
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
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Earlier
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-3">
                {groupedActivities.earlier.map(renderToolCard)}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
