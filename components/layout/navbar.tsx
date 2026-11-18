'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { useAuth } from '@/providers/auth-provider';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tuitions', label: 'Browse Tuitions' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

/** Auth buttons for logged-out visitors. */
function AuthButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'flex flex-col gap-2' : 'flex items-center gap-2'}>
      <Button variant="outline" asChild size={compact ? 'default' : 'sm'}>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild size={compact ? 'default' : 'sm'}>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );
}

/**
 * Public site navbar: logo, navigation, search, theme toggle and auth state.
 * Smoothly displays the signed-in UserMenu when authenticated.
 */
export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !isLoading && Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: mobile trigger + logo */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-surface border-border">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActivePath(pathname, link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Separator className="bg-border" />
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-2">
                  <UserMenu redirectAfterSignOut="/" />
                  <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                </div>
              ) : (
                <AuthButtons compact />
              )}
            </SheetContent>
          </Sheet>

          <Logo className="max-sm:[&_span:last-child]:text-lg" />
        </div>

        {/* Center: desktop links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath(pathname, link.href)
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: search, theme, auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Search tuitions">
            <Link href="/tuitions">
              <Search className="size-5" />
            </Link>
          </Button>
          <ThemeToggle />
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <UserMenu redirectAfterSignOut="/" />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
