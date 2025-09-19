'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  ChefHat, 
  Plus, 
  Calendar, 
  Users, 
  LogOut,
  Menu 
} from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8" />
            <span className="text-xl font-bold">Dorm Chef</span>
          </Link>
        </div>

        {session ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/recipes" className="text-sm font-medium hover:text-primary transition-colors">
                Recipes
              </Link>
              <Link href="/plan" className="text-sm font-medium hover:text-primary transition-colors">
                Plan
              </Link>
              <Link href="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                Feed
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/recipes/new">
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Recipe</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ''} />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{session.user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-card border-b border-border md:hidden">
                <div className="container py-4 space-y-4">
                  <Link
                    href="/recipes"
                    className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Recipes
                  </Link>
                  <Link
                    href="/plan"
                    className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Plan
                  </Link>
                  <Link
                    href="/feed"
                    className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Feed
                  </Link>
                  <Link href="/recipes/new" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipe
                    </Button>
                  </Link>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{session.user?.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}