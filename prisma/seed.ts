import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_USERS = [
  {
    name: 'Dave Johnson',
    email: 'dave@dormchef.dev',
    password: 'password',
  },
  {
    name: 'Mike Chen',
    email: 'mike@dormchef.dev',
    password: 'password',
  },
  {
    name: 'Sam Rodriguez',
    email: 'sam@dormchef.dev',
    password: 'password',
  },
]

const DEMO_RECIPES = [
  {
    title: 'Microwave Mac & Cheese',
    cookTimeMin: 5,
    servings: 1,
    tags: ['microwave-only', 'under-$5', '5-ingredient', 'dorm-friendly'],
    steps: [
      'Add 1/3 cup pasta to microwave-safe bowl',
      'Add water to cover pasta plus 2 inches',
      'Microwave for pasta time + 3-4 minutes',
      'Drain water, add milk and cheese',
      'Microwave 30 seconds, stir and enjoy'
    ],
    ingredients: [
      { name: 'Elbow pasta', qty: 0.33, unit: 'cup', approxPrice: 0.25 },
      { name: 'Shredded cheese', qty: 0.25, unit: 'cup', approxPrice: 0.75 },
      { name: 'Milk', qty: 2, unit: 'tbsp', approxPrice: 0.10 },
    ],
  },
  {
    title: 'Protein Oats Bowl',
    cookTimeMin: 3,
    servings: 1,
    tags: ['high-protein', 'microwave-only', 'under-$5', 'healthy'],
    steps: [
      'Mix oats, protein powder, and water in microwave-safe bowl',
      'Microwave for 90 seconds',
      'Stir and add more water if needed',
      'Top with peanut butter and banana',
      'Mix and enjoy your gains'
    ],
    ingredients: [
      { name: 'Rolled oats', qty: 0.5, unit: 'cup', approxPrice: 0.30 },
      { name: 'Protein powder', qty: 1, unit: 'scoop', approxPrice: 1.50 },
      { name: 'Peanut butter', qty: 1, unit: 'tbsp', approxPrice: 0.25 },
      { name: 'Banana', qty: 0.5, unit: 'piece', approxPrice: 0.50 },
    ],
  },
  {
    title: 'Air Fryer Chicken Thighs',
    cookTimeMin: 25,
    servings: 2,
    tags: ['high-protein', 'no-oven', 'under-$5'],
    steps: [
      'Pat chicken thighs dry with paper towel',
      'Season both sides with salt, pepper, and garlic powder',
      'Preheat air fryer to 380°F',
      'Cook skin-side down for 12 minutes',
      'Flip and cook another 10-15 minutes until internal temp 165°F',
      'Let rest 5 minutes before serving'
    ],
    ingredients: [
      { name: 'Chicken thighs', qty: 2, unit: 'piece', approxPrice: 3.00 },
      { name: 'Salt', qty: 0.5, unit: 'tsp', approxPrice: 0.01 },
      { name: 'Black pepper', qty: 0.25, unit: 'tsp', approxPrice: 0.02 },
      { name: 'Garlic powder', qty: 0.5, unit: 'tsp', approxPrice: 0.05 },
    ],
  },
  {
    title: 'Black Bean Quesadilla',
    cookTimeMin: 10,
    servings: 2,
    tags: ['vegetarian', 'under-$5', '5-ingredient', 'dorm-friendly'],
    steps: [
      'Mash half the black beans with a fork',
      'Mix mashed and whole beans with cumin',
      'Spread bean mixture on one tortilla',
      'Add cheese and top with second tortilla',
      'Cook in skillet 2-3 minutes per side until crispy',
      'Cut into wedges and serve with salsa'
    ],
    ingredients: [
      { name: 'Flour tortillas', qty: 2, unit: 'piece', approxPrice: 0.50 },
      { name: 'Black beans (canned)', qty: 0.5, unit: 'cup', approxPrice: 0.75 },
      { name: 'Shredded cheese', qty: 0.5, unit: 'cup', approxPrice: 1.50 },
      { name: 'Ground cumin', qty: 0.25, unit: 'tsp', approxPrice: 0.05 },
      { name: 'Salsa', qty: 2, unit: 'tbsp', approxPrice: 0.25 },
    ],
  },
  {
    title: 'Greek Yogurt Parfait',
    cookTimeMin: 2,
    servings: 1,
    tags: ['high-protein', 'healthy', 'no-cooking', '5-ingredient'],
    steps: [
      'Layer half the yogurt in a bowl or mason jar',
      'Add half the berries and granola',
      'Add remaining yogurt',
      'Top with remaining berries, granola, and honey',
      'Enjoy immediately or refrigerate for later'
    ],
    ingredients: [
      { name: 'Greek yogurt', qty: 1, unit: 'cup', approxPrice: 1.50 },
      { name: 'Mixed berries', qty: 0.5, unit: 'cup', approxPrice: 2.00 },
      { name: 'Granola', qty: 0.25, unit: 'cup', approxPrice: 0.75 },
      { name: 'Honey', qty: 1, unit: 'tbsp', approxPrice: 0.25 },
    ],
  },
  {
    title: 'Microwave Fried Rice',
    cookTimeMin: 8,
    servings: 2,
    tags: ['microwave-only', 'under-$5', 'dorm-friendly'],
    steps: [
      'Microwave rice with water in covered bowl for 5 minutes',
      'Let stand 2 minutes, then fluff with fork',
      'Beat egg and microwave 1 minute, stirring halfway',
      'Mix egg into rice with soy sauce',
      'Add frozen vegetables and microwave 1 more minute',
      'Stir and season to taste'
    ],
    ingredients: [
      { name: 'Instant rice', qty: 0.5, unit: 'cup', approxPrice: 0.30 },
      { name: 'Egg', qty: 1, unit: 'piece', approxPrice: 0.25 },
      { name: 'Frozen mixed vegetables', qty: 0.5, unit: 'cup', approxPrice: 0.75 },
      { name: 'Soy sauce', qty: 1, unit: 'tbsp', approxPrice: 0.10 },
    ],
  },
  {
    title: 'Cottage Cheese Power Bowl',
    cookTimeMin: 1,
    servings: 1,
    tags: ['high-protein', 'no-cooking', 'healthy', 'under-$5'],
    steps: [
      'Scoop cottage cheese into bowl',
      'Add chopped cucumber and cherry tomatoes',
      'Drizzle with olive oil',
      'Season with salt, pepper, and everything bagel seasoning',
      'Mix and enjoy this protein-packed meal'
    ],
    ingredients: [
      { name: 'Cottage cheese', qty: 1, unit: 'cup', approxPrice: 1.25 },
      { name: 'Cucumber', qty: 0.5, unit: 'cup', approxPrice: 0.50 },
      { name: 'Cherry tomatoes', qty: 0.5, unit: 'cup', approxPrice: 1.00 },
      { name: 'Olive oil', qty: 1, unit: 'tsp', approxPrice: 0.15 },
      { name: 'Everything bagel seasoning', qty: 0.5, unit: 'tsp', approxPrice: 0.10 },
    ],
  },
  {
    title: 'Canned Chicken Wrap',
    cookTimeMin: 5,
    servings: 1,
    tags: ['high-protein', 'no-cooking', 'under-$5', 'dorm-friendly'],
    steps: [
      'Drain canned chicken and add to bowl',
      'Mix chicken with mayo and hot sauce',
      'Spread mixture on tortilla',
      'Add lettuce and cheese',
      'Roll tightly and slice in half',
      'Wrap in foil for easy eating'
    ],
    ingredients: [
      { name: 'Canned chicken breast', qty: 1, unit: 'can', approxPrice: 2.50 },
      { name: 'Flour tortilla', qty: 1, unit: 'piece', approxPrice: 0.25 },
      { name: 'Mayonnaise', qty: 1, unit: 'tbsp', approxPrice: 0.15 },
      { name: 'Lettuce', qty: 0.25, unit: 'cup', approxPrice: 0.50 },
      { name: 'Shredded cheese', qty: 2, unit: 'tbsp', approxPrice: 0.60 },
    ],
  },
  {
    title: 'Microwave Lentil Soup',
    cookTimeMin: 12,
    servings: 2,
    tags: ['vegetarian', 'microwave-only', 'healthy', 'under-$5'],
    steps: [
      'Combine lentils, broth, and diced tomatoes in microwave-safe bowl',
      'Cover and microwave for 8 minutes',
      'Stir and add frozen vegetables',
      'Microwave 3 more minutes',
      'Season with salt, pepper, and Italian seasoning',
      'Let stand 2 minutes before serving'
    ],
    ingredients: [
      { name: 'Red lentils', qty: 0.5, unit: 'cup', approxPrice: 1.00 },
      { name: 'Vegetable broth', qty: 1.5, unit: 'cup', approxPrice: 0.75 },
      { name: 'Diced tomatoes (canned)', qty: 0.5, unit: 'cup', approxPrice: 0.50 },
      { name: 'Frozen mixed vegetables', qty: 0.5, unit: 'cup', approxPrice: 0.75 },
      { name: 'Italian seasoning', qty: 0.5, unit: 'tsp', approxPrice: 0.05 },
    ],
  },
  {
    title: 'Frozen Veggie Stir-Up',
    cookTimeMin: 6,
    servings: 1,
    tags: ['vegetarian', 'microwave-only', 'healthy', 'under-$5'],
    steps: [
      'Add frozen vegetables to microwave-safe bowl',
      'Add a splash of water',
      'Microwave for 3 minutes',
      'Drain excess water',
      'Add soy sauce, garlic powder, and sesame oil',
      'Stir well and serve over rice if desired'
    ],
    ingredients: [
      { name: 'Frozen stir-fry vegetables', qty: 1, unit: 'cup', approxPrice: 1.25 },
      { name: 'Soy sauce', qty: 1, unit: 'tbsp', approxPrice: 0.10 },
      { name: 'Garlic powder', qty: 0.25, unit: 'tsp', approxPrice: 0.02 },
      { name: 'Sesame oil', qty: 0.5, unit: 'tsp', approxPrice: 0.15 },
    ],
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo users
  console.log('👥 Creating demo users...')
  const users = []
  
  for (const userData of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    })
    
    users.push(user)
    console.log(`✅ Created user: ${user.name} (${user.email})`)
  }

  // Create follow relationships
  console.log('🤝 Creating follow relationships...')
  
  // Dave follows Mike and Sam
  await prisma.follow.upsert({
    where: {
      fromId_toId: {
        fromId: users[0].id, // Dave
        toId: users[1].id,   // Mike
      },
    },
    update: {},
    create: {
      fromId: users[0].id,
      toId: users[1].id,
    },
  })

  await prisma.follow.upsert({
    where: {
      fromId_toId: {
        fromId: users[0].id, // Dave
        toId: users[2].id,   // Sam
      },
    },
    update: {},
    create: {
      fromId: users[0].id,
      toId: users[2].id,
    },
  })

  console.log('✅ Dave now follows Mike and Sam')

  // Create recipes
  console.log('🍳 Creating demo recipes...')
  const recipes = []
  
  for (let i = 0; i < DEMO_RECIPES.length; i++) {
    const recipeData = DEMO_RECIPES[i]
    const authorIndex = i % users.length // Distribute recipes among users
    
    const estCostTotal = recipeData.ingredients.reduce(
      (total, ing) => total + ing.approxPrice,
      0
    )

    const recipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        cookTimeMin: recipeData.cookTimeMin,
        servings: recipeData.servings,
        estCostTotal,
        tags: JSON.stringify(recipeData.tags),
        steps: JSON.stringify(recipeData.steps),
        authorId: users[authorIndex].id,
        ingredients: {
          create: recipeData.ingredients,
        },
      },
      include: {
        ingredients: true,
      },
    })
    
    recipes.push(recipe)
    console.log(`✅ Created recipe: ${recipe.title} by ${users[authorIndex].name}`)
  }

  // Create a meal plan for Dave with some recipes
  console.log('📅 Creating sample meal plan for Dave...')
  
  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Get Monday
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const weekStart = getWeekStart()
  
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: users[0].id, // Dave
      weekOf: weekStart,
    },
  })

  // Add some recipes to Dave's meal plan
  const mealPlanItems = [
    { dayIndex: 0, mealType: 'Breakfast', recipeId: recipes[1].id, servings: 1 }, // Monday: Protein Oats
    { dayIndex: 0, mealType: 'Lunch', recipeId: recipes[3].id, servings: 1 }, // Monday: Black Bean Quesadilla
    { dayIndex: 1, mealType: 'Breakfast', recipeId: recipes[4].id, servings: 1 }, // Tuesday: Greek Yogurt Parfait
    { dayIndex: 1, mealType: 'Dinner', recipeId: recipes[2].id, servings: 1 }, // Tuesday: Air Fryer Chicken
    { dayIndex: 2, mealType: 'Lunch', recipeId: recipes[5].id, servings: 1 }, // Wednesday: Microwave Fried Rice
    { dayIndex: 3, mealType: 'Dinner', recipeId: recipes[8].id, servings: 2 }, // Thursday: Lentil Soup
  ]

  for (const item of mealPlanItems) {
    await prisma.mealPlanItem.create({
      data: {
        mealPlanId: mealPlan.id,
        ...item,
      },
    })
  }

  console.log(`✅ Created meal plan for Dave with ${mealPlanItems.length} items`)

  // Add some likes to recipes
  console.log('❤️ Adding some recipe likes...')
  
  const likes = [
    { userId: users[0].id, recipeId: recipes[1].id }, // Dave likes Protein Oats
    { userId: users[0].id, recipeId: recipes[2].id }, // Dave likes Air Fryer Chicken
    { userId: users[1].id, recipeId: recipes[0].id }, // Mike likes Mac & Cheese
    { userId: users[1].id, recipeId: recipes[4].id }, // Mike likes Greek Yogurt Parfait
    { userId: users[2].id, recipeId: recipes[3].id }, // Sam likes Black Bean Quesadilla
    { userId: users[2].id, recipeId: recipes[6].id }, // Sam likes Cottage Cheese Bowl
  ]

  for (const like of likes) {
    await prisma.like.create({
      data: like,
    })
  }

  console.log(`✅ Added ${likes.length} likes to recipes`)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Demo accounts:')
  for (const user of DEMO_USERS) {
    console.log(`   ${user.email} / ${user.password}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })