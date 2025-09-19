# 🍳 Dorm Chef

**Eat better, spend less. Tiny-kitchen friendly.**

A minimal but production-quality MVP web app tailored for college-aged men cooking in tiny kitchens on small budgets. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## ✨ Features

### 🥘 Meal Catalog
- Create, edit, and browse dorm-friendly recipes
- Auto-calculated cost per serving
- Tags for easy filtering (high-protein, under-$5, microwave-only, etc.)
- Search functionality

### 📅 Weekly Meal Planner  
- 7-day grid layout (Monday-Sunday)
- Add recipes to any day/meal slot
- One-click grocery list generation
- Duplicate recipes across multiple days

### 🛒 Smart Grocery Lists
- Auto-aggregates ingredients from meal plan
- Categorizes items (protein, produce, dairy, etc.)
- Shows total estimated cost
- Track purchased items with checkboxes

### 👥 Social Features
- Follow other users
- Activity feed showing friends' new recipes and meal plans
- Like recipes
- Copy recipes to your own meal plan

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Git

### Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd dorm-chef
   pnpm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Prisma + SQLite (easily switchable to PostgreSQL)
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 🎭 Demo Accounts

The seed script creates three demo users you can use immediately:

- **dave@dormchef.dev** / password
- **mike@dormchef.dev** / password  
- **sam@dormchef.dev** / password

Dave follows Mike and Sam, and has a pre-populated meal plan to demonstrate the grocery list feature.

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **Recipe**: Recipes with ingredients, steps, tags, and cost calculation
- **MealPlan**: Weekly meal planning (one per user per week)
- **MealPlanItem**: Individual recipe assignments to meal slots
- **Follow**: Social following relationships
- **Like**: Recipe likes

### Key Features
- Automatic cost calculation per serving
- JSON storage for flexible arrays (tags, steps)  
- Optimized indexes for performance
- Cascade deletes for data integrity

## 🗂️ Project Structure

```
dorm-chef/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── recipes/       # Recipe CRUD
│   │   ├── mealplan/      # Meal planning
│   │   ├── grocery/       # Grocery list generation
│   │   ├── follow/        # Social following
│   │   └── feed/          # Activity feed
│   ├── auth/              # Sign in/up pages
│   ├── recipes/           # Recipe pages
│   ├── plan/              # Meal planner & grocery
│   └── feed/              # Social feed
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   └── [feature-components] # Feature-specific components
├── lib/                   # Utilities
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   └── utils.ts           # Helper functions
└── prisma/                # Database
    ├── schema.prisma      # Database schema
    └── seed.ts            # Demo data
```

## 🔄 Switching to PostgreSQL

For production, switch from SQLite to PostgreSQL:

1. **Update your `.env`:**
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/dormchef"
   ```

2. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migration:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

## 🛠️ Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed demo data
- `pnpm db:studio` - Open Prisma Studio

## 🎨 Design Philosophy

### Audience-Focused
Built specifically for college guys who want to:
- Eat better without complicated cooking
- Spend less money on food
- Not waste time on meal planning
- Share practical recipes with friends

### Minimal & Masculine
- Dark mode by default
- Clean, neutral colors
- Bold typography
- No unnecessary fluff
- Direct, non-judgmental tone

### Dorm-Optimized
- Focus on microwave, hot plate, and air fryer recipes
- Small serving sizes (1-2 people)
- Budget-conscious ingredient choices
- Quick cook times
- Minimal cleanup required

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy!

### Railway
1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables
4. Deploy!

### Environment Variables for Production
```bash
DATABASE_URL="postgresql://..."  # Your PostgreSQL URL
NEXTAUTH_SECRET="your-secret-32-chars-min"
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 Core User Flows

### 1. New User Onboarding
1. Sign up with email/password
2. Browse existing recipes  
3. Create first recipe
4. Add recipes to meal plan
5. Generate grocery list

### 2. Recipe Discovery & Planning
1. Search/filter recipes by tags
2. View recipe details and cost
3. Add to weekly meal plan
4. Generate shopping list
5. Track purchased items

### 3. Social Engagement
1. Follow other users
2. See friends' activity in feed
3. Like and save recipes
4. Copy recipes to own meal plan

## 🎯 Success Metrics

The app successfully demonstrates:
- ✅ User registration and authentication
- ✅ Recipe creation with cost calculation
- ✅ Weekly meal planning with drag-and-drop feel
- ✅ Automatic grocery list generation
- ✅ Social features (following, feed, likes)
- ✅ Responsive design that works on mobile
- ✅ Fast performance with optimized queries
- ✅ Production-ready code with proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for college students who want to eat better without the hassle.**