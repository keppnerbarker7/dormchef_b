'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { ShoppingCart, DollarSign } from 'lucide-react'

interface GroceryItem {
  name: string
  unit: string
  qty: number
  approxPrice: number
  category: string
  purchased?: boolean
}

interface GroceryData {
  items: GroceryItem[]
  totalCost: number
  categorizedItems: Record<string, GroceryItem[]>
}

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein',
  produce: 'Produce',
  dairy: 'Dairy',
  grains: 'Grains & Carbs',
  pantry: 'Pantry & Others'
}

const CATEGORY_ORDER = ['protein', 'produce', 'dairy', 'grains', 'pantry']

export default function GroceryList() {
  const [groceryData, setGroceryData] = useState<GroceryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set())

  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  useEffect(() => {
    fetchGroceryList()
  }, [])

  const fetchGroceryList = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekOf: getWeekStart() }),
      })

      const data = await response.json()
      setGroceryData(data)
    } catch (error) {
      console.error('Error fetching grocery list:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePurchased = (itemKey: string) => {
    setPurchasedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey)
      } else {
        newSet.add(itemKey)
      }
      return newSet
    })
  }

  const getItemKey = (item: GroceryItem) => `${item.name}_${item.unit}`

  const calculateRemainingCost = () => {
    if (!groceryData) return 0
    return groceryData.items
      .filter(item => !purchasedItems.has(getItemKey(item)))
      .reduce((total, item) => total + item.approxPrice, 0)
  }

  const purchasedCount = groceryData ? groceryData.items.filter(item => 
    purchasedItems.has(getItemKey(item))
  ).length : 0

  const totalItems = groceryData?.items.length || 0

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <Separator />
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!groceryData || groceryData.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No grocery list yet</h3>
          <p className="text-muted-foreground">
            Add some recipes to your meal plan to generate a grocery list
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Shopping Summary</span>
            <Badge variant="outline">
              {purchasedCount}/{totalItems} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">${groceryData.totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">${calculateRemainingCost().toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(purchasedCount / totalItems) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categorized Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORY_ORDER.map(category => {
          const items = groceryData.categorizedItems[category] || []
          if (items.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{CATEGORY_LABELS[category]}</span>
                  <Badge variant="secondary">{items.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item, index) => {
                  const itemKey = getItemKey(item)
                  const isPurchased = purchasedItems.has(itemKey)
                  
                  return (
                    <div
                      key={`${category}-${index}`}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isPurchased 
                          ? 'bg-muted/50 text-muted-foreground line-through' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={isPurchased}
                        onCheckedChange={() => togglePurchased(itemKey)}
                      />
                      
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.qty} {item.unit} {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${item.approxPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}