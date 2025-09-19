'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plus, X, Clock, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner']

interface Recipe {
  id: string
  title: string
  cookTimeMin: number
  estCostTotal: number
  servings: number
  tags: string[]
  author: {
    name: string
  }
}

interface MealPlanItem {
  id: string
  dayIndex: number
  mealType: string
  servings: number
  recipe: Recipe
}

interface MealPlan {
  id: string
  weekOf: string
  items: MealPlanItem[]
}

export default function MealPlanGrid() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; mealType: string } | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Get Monday
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  useEffect(() => {
    fetchMealPlan()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchRecipes()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchMealPlan = async () => {
    setLoading(true)
    try {
      const weekOf = getWeekStart()
      const response = await fetch(`/api/mealplan?weekOf=${weekOf}`)
      const data = await response.json()
      setMealPlan(data)
    } catch (error) {
      console.error('Error fetching meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchRecipes = async () => {
    try {
      const response = await fetch(`/api/recipes?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching recipes:', error)
    }
  }

  const addRecipeToSlot = async (recipeId: string) => {
    if (!selectedSlot) return

    try {
      const response = await fetch('/api/mealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          dayIndex: selectedSlot.dayIndex,
          mealType: selectedSlot.mealType,
          weekOf: getWeekStart(),
          servings: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add recipe')
      }

      fetchMealPlan()
      setIsSearchOpen(false)
      setSelectedSlot(null)
      setSearchQuery('')
    } catch (error) {
      console.error('Error adding recipe:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/mealplan/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove item')
      }

      fetchMealPlan()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const openAddRecipe = (dayIndex: number, mealType: string) => {
    setSelectedSlot({ dayIndex, mealType })
    setIsSearchOpen(true)
  }

  const getItemsForSlot = (dayIndex: number, mealType: string) => {
    return mealPlan?.items.filter(
      item => item.dayIndex === dayIndex && item.mealType === mealType
    ) || []
  }

  if (loading) {
    return (
      <div className="grid grid-cols-8 gap-4">
        {[...Array(8 * 4)].map((_, i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-8 gap-4">
        <div></div>
        {DAYS.map(day => (
          <Card key={day} className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{day}</CardTitle>
            </CardHeader>
          </Card>
        ))}

        {MEAL_TYPES.map(mealType => (
          <div key={mealType} className="contents">
            <Card className="flex items-center justify-center">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm text-center">{mealType}</h3>
              </CardContent>
            </Card>
            
            {DAYS.map((day, dayIndex) => {
              const items = getItemsForSlot(dayIndex, mealType)
              
              return (
                <Card key={`${dayIndex}-${mealType}`} className="min-h-32">
                  <CardContent className="p-3 space-y-2">
                    {items.length > 0 ? (
                      items.map(item => (
                        <div
                          key={item.id}
                          className="relative bg-muted p-2 rounded text-xs group"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          <div className="pr-4">
                            <p className="font-medium truncate">{item.recipe.title}</p>
                            <div className="flex items-center justify-between mt-1 text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.recipe.cookTimeMin}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>
                                  ${((item.recipe.estCostTotal / item.recipe.servings) * item.servings).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {item.servings > 1 && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {item.servings}x
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-full min-h-24 border-dashed border-2"
                        onClick={() => openAddRecipe(dayIndex, mealType)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {items.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => openAddRecipe(dayIndex, mealType)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))}
      </div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Recipe</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map(recipe => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted"
                  onClick={() => addRecipeToSlot(recipe.id)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{recipe.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.cookTimeMin} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${(recipe.estCostTotal / recipe.servings).toFixed(2)}/serving</span>
                      </div>
                      <span>by {recipe.author.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm">Add</Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}