/**
 * Role-based sidebar navigation for the dashboard.
 * One source of truth: the sidebar, mobile drawer and topbar all read
 * from this configuration, so adding a page means adding one entry here.
 */
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LibraryBig,
  Mailbox,
  PlusSquare,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PROFILE_ITEM: NavItem = {
  href: "/dashboard/profile",
  label: "Profile",
  icon: UserRound,
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student/my-applications", label: "My Applications", icon: ClipboardList },
    { href: "/pricing", label: "Subscription", icon: CreditCard },
    PROFILE_ITEM,
  ],
  tutor: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/tutor/post-tuition", label: "Post Tuition", icon: PlusSquare },
    { href: "/dashboard/tutor/my-tuitions", label: "My Tuitions", icon: LibraryBig },
    { href: "/dashboard/tutor/applicants", label: "Applicants", icon: Mailbox },
    { href: "/pricing", label: "Subscription", icon: CreditCard },
    PROFILE_ITEM,
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/tuitions", label: "Tuitions", icon: LibraryBig },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Wallet },
    PROFILE_ITEM,
  ],
};
