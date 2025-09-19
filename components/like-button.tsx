'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'

export default function LikeButton({ 
  recipeId, 
  initialLiked = false 
}: { 
  recipeId: string
  initialLiked?: boolean
}) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)

  const toggleLike = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      setIsLiked(data.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={toggleLike}
      disabled={isLoading}
      className="flex items-center space-x-2"
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
      />
      <span>{isLiked ? 'Liked' : 'Like'}</span>
    </Button>
  )
}