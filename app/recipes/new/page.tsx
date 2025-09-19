'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, X } from 'lucide-react'

interface Ingredient {
  name: string
  qty: number
  unit: string
  approxPrice: number
}

const COMMON_TAGS = [
  'high-protein',
  'under-$5',
  'no-oven',
  'microwave-only',
  '5-ingredient',
  'dorm-friendly',
  'vegetarian',
  'quick',
  'healthy'
]

const COMMON_UNITS = ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'ml', 'piece', 'slice']

export default function NewRecipePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [cookTimeMin, setCookTimeMin] = useState(30)
  const [servings, setServings] = useState(2)
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', qty: 1, unit: 'cup', approxPrice: 0 }
  ])

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', qty: 1, unit: 'cup', approxPrice: 0 }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addStep = () => {
    setSteps([...steps, ''])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, value: string) => {
    const updated = [...steps]
    updated[index] = value
    setSteps(updated)
  }

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag])
      setCustomTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const estCostTotal = ingredients.reduce((total, ing) => total + ing.approxPrice, 0)
  const costPerServing = servings > 0 ? estCostTotal / servings : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          heroImage: heroImage || undefined,
          cookTimeMin,
          servings,
          tags,
          steps: steps.filter(s => s.trim()),
          ingredients: ingredients.filter(ing => ing.name.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create recipe')
      }

      const recipe = await response.json()
      router.push(`/recipes/${recipe.id}`)
    } catch (error) {
      console.error('Error creating recipe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Recipe</h1>
          <p className="text-muted-foreground">
            Share your dorm-friendly recipe with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Microwave Mac & Cheese"
                  required
                />
              </div>

              <div>
                <Label htmlFor="heroImage">Image URL (optional)</Label>
                <Input
                  id="heroImage"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cookTimeMin">Cook Time (minutes)</Label>
                  <Input
                    id="cookTimeMin"
                    type="number"
                    value={cookTimeMin}
                    onChange={(e) => setCookTimeMin(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Estimated Total Cost: <strong>${estCostTotal.toFixed(2)}</strong></div>
                  <div>Cost per Serving: <strong>${costPerServing.toFixed(2)}</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    variant={tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <Button type="button" onClick={addCustomTag}>Add</Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label>Ingredient</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="e.g., Ground beef"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={ingredient.qty}
                      onChange={(e) => updateIngredient(index, 'qty', Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    >
                      {COMMON_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Label>Est. Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={ingredient.approxPrice}
                      onChange={(e) => updateIngredient(index, 'approxPrice', Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex space-x-2">
                  <div className="flex-1">
                    <Label>Step {index + 1}</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder="Describe this step..."
                      required
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(index)}
                      disabled={steps.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/recipes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}