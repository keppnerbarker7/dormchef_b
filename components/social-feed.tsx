'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Clock, DollarSign, Users, Plus } from 'lucide-react'

interface FeedItem {
  id: string
  type: 'recipe_created' | 'recipe_added_to_week'
  user: {
    id: string
    name: string
    image?: string
  }
  recipe: {
    id: string
    title: string
    cookTimeMin: number
    servings: number
    estCostTotal: number
    tags: string[]
    heroImage?: string
  }
  mealType?: string
  dayIndex?: number
  createdAt: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SocialFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/feed')
      if (!response.ok) {
        throw new Error('Failed to fetch feed')
      }
      const data = await response.json()
      setFeedItems(data)
    } catch (error) {
      console.error('Error fetching feed:', error)
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getActivityText = (item: FeedItem) => {
    switch (item.type) {
      case 'recipe_created':
        return 'created a new recipe'
      case 'recipe_added_to_week':
        return `added to ${DAYS[item.dayIndex!]} ${item.mealType}`
      default:
        return 'did something'
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Failed to load feed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchFeed}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (feedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground mb-4">
              Follow some users to see their recipes and meal plans here
            </p>
            <Link href="/recipes">
              <Button>
                Discover Recipes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {feedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={item.user.image || ''} />
                  <AvatarFallback>
                    {item.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getActivityText(item)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Link href={`/recipes/${item.recipe.id}`}>
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex space-x-4">
                  {item.recipe.heroImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.recipe.heroImage}
                        alt={item.recipe.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{item.recipe.title}</h3>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.recipe.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.recipe.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{item.recipe.cookTimeMin} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${(item.recipe.estCostTotal / item.recipe.servings).toFixed(2)}/serving
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}