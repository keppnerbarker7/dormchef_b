'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Calendar, Plus } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner']

export default function AddToWeekButton({ recipeId }: { recipeId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Get Monday
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  const addToMealPlan = async (dayIndex: number, mealType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          dayIndex,
          mealType,
          weekOf: getWeekStart(),
          servings: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to meal plan')
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Error adding to meal plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add to Week
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Meal Plan</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="space-y-2">
              <h4 className="font-medium">{day}</h4>
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TYPES.map((mealType) => (
                  <Button
                    key={`${dayIndex}-${mealType}`}
                    variant="outline"
                    size="sm"
                    onClick={() => addToMealPlan(dayIndex, mealType)}
                    disabled={isLoading}
                  >
                    {mealType}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}