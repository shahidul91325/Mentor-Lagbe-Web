"use client";

/**
 * Signed-in user menu (avatar + dropdown).
 * Used in the dashboard topbar and the public navbar.
 *
 * Sign-out goes through AuthProvider → BetterAuth, which also drops
 * our stored JWT. The role shown in the menu comes from server-side
 * session data, never from anything the user can edit.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LayoutDashboard, LoaderCircle, LogOut, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";

interface UserMenuProps {
  /** Where to go after signing out (defaults to staying put). */
  redirectAfterSignOut?: string;
  /** Show the name next to the avatar (hidden on small screens). */
  showName?: boolean;
}

/** First letters of the first two words, e.g. "Rakib Hasan" → "RH". */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserMenu({
  redirectAfterSignOut,
  showName = true,
}: UserMenuProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out", { description: "See you again soon!" });
      if (redirectAfterSignOut) {
        router.push(redirectAfterSignOut);
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sign out failed. Please try again.",
      );
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar className="size-7">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <span className="hidden items-center gap-2 md:flex">
              <span className="max-w-28 truncate text-sm font-medium">
                {user.name}
              </span>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-1.5">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
          <Badge variant="secondary" className="capitalize">
            {user.role} · {user.plan}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard")}>
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/profile")}>
          <UserCog />
          Update Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault(); // keep the menu open while signing out
            void handleSignOut();
          }}
        >
          {signingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
