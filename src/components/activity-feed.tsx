"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Heart, HeartCrack, Tag, RefreshCw, Package, MessageCircle } from "lucide-react"
import Link from "next/link"
import { getActivities, type Activity, type ActivityType } from "@/lib/activities-client"

interface ActivityFeedProps {
  limit?: number
  showTitle?: boolean
  className?: string
}

export function ActivityFeed({ limit = 10, showTitle = true, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActivities()
  }, [limit])

  async function loadActivities() {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getActivities(limit, 0)
      setActivities(data)
    } catch (err) {
      setError('Failed to load activities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function getActivityIcon(type: ActivityType) {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'unlike':
        return <HeartCrack className="h-4 w-4 text-gray-400" />
      case 'feature_add':
        return <Tag className="h-4 w-4 text-blue-500" />
      case 'alternative_add':
        return <RefreshCw className="h-4 w-4 text-orange-500" />
      case 'app_add':
        return <Package className="h-4 w-4 text-green-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Package className="h-4 w-4 text-gray-400" />
    }
  }

  function formatActivity(activity: Activity): JSX.Element {
    const timeAgo = getTimeAgo(activity.timestamp)
    
    switch (activity.type) {
      case 'like':
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' liked '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
      case 'unlike':
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' unliked '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
      case 'feature_add':
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' added '}
            <span className="font-medium">{activity.metadata.feature}</span>
            {' as a feature to '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
      case 'alternative_add':
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' added '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            {' as alternative'}
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
      case 'app_add':
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' added '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
      default:
        return (
          <>
            <Link href={`/user/${activity.username}`} className="font-medium hover:underline">
              {activity.username}
            </Link>
            {' performed an action on '}
            <Link href={`/scripts/${activity.targetSlug}`} className="font-medium hover:underline">
              {activity.targetName}
            </Link>
            <span className="text-muted-foreground"> • {timeAgo}</span>
          </>
        )
    }
  }

  function getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
    return `${Math.floor(seconds / 2592000)}mo ago`
  }

  if (loading) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadActivities} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No activities yet. Be the first to like an app!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={activity.avatar} alt={activity.username} />
                  <AvatarFallback>
                    {activity.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm leading-relaxed">
                  {formatActivity(activity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
