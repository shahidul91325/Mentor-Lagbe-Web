'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Search,
  RefreshCw,
  Mail,
  Sparkles,
  UserCog,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

import type { LucideProps } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { EmptyState } from '@/components/shared/empty-state';
import { RoleGuard } from '@/components/auth/role-guard';

import type { Role } from '@/types';
import { fetchAdminUsers, patchUserRole } from '@/lib/admin';

// --------------------------------------------------
// Types
// --------------------------------------------------

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

type RoleFilter = 'all' | Role;

interface RoleConfigItem {
  label: string;
  icon: ComponentType<LucideProps>;
  className: string;
}

// --------------------------------------------------
// Role Configuration
// --------------------------------------------------

const roleConfig: Record<Role, RoleConfigItem> = {
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    className: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },

  tutor: {
    label: 'Tutor',
    icon: BookOpen,
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },

  student: {
    label: 'Student',
    icon: GraduationCap,
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
};

const roleOptions: Role[] = ['tutor', 'student', 'admin'];

// --------------------------------------------------
// Animations
// --------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut' as const,
    },
  },
};

// --------------------------------------------------
// Role Badge
// --------------------------------------------------

function RoleBadge({ role }: { role: Role }) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

// --------------------------------------------------
// Role Select
// --------------------------------------------------

function RoleSelect({
  value,
  disabled,
  onChange,
  mobile = false,
}: {
  value: Role;
  disabled: boolean;
  onChange: (value: Role) => void;
  mobile?: boolean;
}) {
  const currentRole = roleConfig[value];
  const CurrentIcon = currentRole.icon;

  return (
    <Select value={value} disabled={disabled} onValueChange={(newValue) => onChange(newValue as Role)}>
      <SelectTrigger
        aria-label="Change user role"
        className={`rounded-xl border-border/70 bg-background text-foreground transition-all hover:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
          mobile ? 'h-11 w-full' : 'h-10 w-36 text-xs'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${currentRole.className}`}>
            <CurrentIcon className="h-4 w-4" />
          </span>

          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent
        position="popper"
        align="end"
        sideOffset={6}
        className="min-w-[190px] rounded-xl border border-border/70 bg-background p-1.5 text-foreground shadow-xl"
      >
        {roleOptions.map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const selected = value === role;

          return (
            <SelectItem
              key={role}
              value={role}
              className="cursor-pointer rounded-lg bg-transparent py-2.5 px-3 text-foreground transition-colors hover:bg-muted focus:bg-accent/15 focus:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
                  <Icon className="h-4 w-4" />
                </span>

                <span className="flex-1 font-medium text-foreground">{config.label}</span>

                {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

// --------------------------------------------------
// Statistics Card
// --------------------------------------------------

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  description: string;
  icon: ComponentType<LucideProps>;
  color: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div
          className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.08] blur-2xl transition-transform duration-500 group-hover:scale-150 ${color}`}
        />

        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight">{value.toLocaleString()}</h3>

              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            </div>

            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color} bg-opacity-10`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --------------------------------------------------
// Loading Skeleton
// --------------------------------------------------

function UsersTableSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>

          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------
// Helper
// --------------------------------------------------

function getInitials(name?: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'U'
  );
}

// --------------------------------------------------
// Admin Users Content
// --------------------------------------------------

function AdminUsersContent() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminUsers({ limit: 1000 });

      if (!data || !Array.isArray(data.users)) {
        throw new Error('Invalid users response from server.');
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === 'student').length,
      tutors: users.filter((user) => user.role === 'tutor').length,
      admins: users.filter((user) => user.role === 'admin').length,
    }),
    [users]
  );

  // Search and role filter
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = user.name?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';

      const matchesSearch = !query || name.includes(query) || email.includes(query);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Update role
  const handleRoleChange = async (userId: string, newRole: Role) => {
    const targetUser = users.find((user) => user._id === userId);

    if (!targetUser || targetUser.role === newRole) {
      return;
    }

    const previousRole = targetUser.role;

    setUpdatingUserId(userId);

    setUsers((currentUsers) => currentUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user)));

    try {
      await patchUserRole(userId, newRole);

      toast.success('User role updated successfully', {
        description: `${targetUser.name || targetUser.email} is now ${roleConfig[newRole].label}.`,
      });
    } catch (err) {
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user._id === userId ? { ...user, role: previousRole } : user))
      );

      toast.error(err instanceof Error ? err.message : 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="min-h-screen space-y-7 pb-10">
      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-blue-500/5 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Control Center
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Users Management</h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Manage platform members, monitor user accounts, and control access permissions from one place.
            </p>
          </div>

          <Button
            onClick={() => void loadUsers()}
            disabled={loading}
            className="w-full gap-2 rounded-xl shadow-lg shadow-primary/20 sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Users
          </Button>
        </div>
      </motion.div>

      {/* Statistics */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Users"
          value={stats.total}
          description="All registered accounts"
          icon={Users}
          color="bg-primary text-primary"
        />

        <StatCard
          title="Students"
          value={stats.students}
          description="Learning community"
          icon={GraduationCap}
          color="bg-emerald-500 text-emerald-500"
        />

        <StatCard
          title="Tutors"
          value={stats.tutors}
          description="Teaching professionals"
          icon={BookOpen}
          color="bg-blue-500 text-blue-500"
        />

        <StatCard
          title="Administrators"
          value={stats.admins}
          description="Platform management"
          icon={ShieldCheck}
          color="bg-violet-500 text-violet-500"
        />
      </motion.div>

      {/* Users Management */}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
          {/* Toolbar */}

          <div className="border-b border-border/60 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCog className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">All Platform Users</h2>

                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Loading users...' : `${filteredUsers.length} of ${users.length} users`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name or email..."
                    className="h-10 rounded-xl pl-9"
                  />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/70 bg-background text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 sm:w-36">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    align="end"
                    sideOffset={6}
                    className="min-w-[160px] rounded-xl border border-border/70 bg-background p-1.5 text-foreground shadow-lg"
                  >
                    <SelectItem
                      value="all"
                      className="cursor-pointer rounded-lg bg-transparent py-2 px-3 text-foreground transition-colors hover:bg-muted focus:bg-accent/15 focus:text-accent-foreground"
                    >
                      All Roles
                    </SelectItem>

                    <SelectItem
                      value="student"
                      className="cursor-pointer rounded-lg bg-transparent py-2 px-3 text-foreground transition-colors hover:bg-muted focus:bg-accent/15 focus:text-accent-foreground"
                    >
                      Students
                    </SelectItem>

                    <SelectItem
                      value="tutor"
                      className="cursor-pointer rounded-lg bg-transparent py-2 px-3 text-foreground transition-colors hover:bg-muted focus:bg-accent/15 focus:text-accent-foreground"
                    >
                      Tutors
                    </SelectItem>

                    <SelectItem
                      value="admin"
                      className="cursor-pointer rounded-lg bg-transparent py-2 px-3 text-foreground transition-colors hover:bg-muted focus:bg-accent/15 focus:text-accent-foreground"
                    >
                      Admins
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <UsersTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>

              <h3 className="font-semibold">Unable to load users</h3>

              <p className="max-w-md text-sm text-muted-foreground">{error}</p>

              <Button variant="outline" onClick={() => void loadUsers()} className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            search || roleFilter !== 'all' ? (
              <EmptyState title="No matching users" description="Try changing your search query or role filter." />
            ) : (
              <EmptyState title="No users found" description="There are no registered users in the system yet." />
            )
          ) : (
            <>
              {/* Desktop Table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b border-border/60">
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">User</th>

                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Email Address</th>

                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Current Role</th>

                      <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Manage Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((user, index) => {
                        const isUpdating = updatingUserId === user._id;

                        return (
                          <motion.tr
                            key={user._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(index * 0.025, 0.3),
                            }}
                            className="group border-b border-border/50 transition-colors hover:bg-muted/40"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 text-sm font-bold text-primary ring-2 ring-background">
                                  {getInitials(user.name)}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold">{user.name || 'Unnamed User'}</p>

                                  <p className="text-xs text-muted-foreground">ID: {user._id.slice(-8)}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />

                                <span className="break-all">{user.email}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <RoleBadge role={user.role} />
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {isUpdating && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />}

                                <RoleSelect
                                  value={user.role}
                                  disabled={isUpdating}
                                  onChange={(newRole) => void handleRoleChange(user._id, newRole)}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredUsers.map((user, index) => {
                  const isUpdating = updatingUserId === user._id;

                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 font-bold text-primary">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold">{user.name || 'Unnamed User'}</h3>

                          <p className="mt-1 break-all text-xs text-muted-foreground">{user.email}</p>

                          <div className="mt-3">
                            <RoleBadge role={user.role} />
                          </div>
                        </div>

                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>

                      <div className="mt-4 border-t border-border/60 pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">Change user role</p>

                          {isUpdating && (
                            <span className="flex items-center gap-1.5 text-xs text-primary">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Updating...
                            </span>
                          )}
                        </div>

                        <RoleSelect
                          value={user.role}
                          disabled={isUpdating}
                          mobile
                          onChange={(newRole) => void handleRoleChange(user._id, newRole)}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}

          {!loading && !error && users.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold text-foreground">{users.length}</span> users
              </p>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                User management is active
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

// --------------------------------------------------
// Page Export
// --------------------------------------------------

export default function AdminUsersPage() {
  return (
    <RoleGuard allowed={['admin']}>
      <AdminUsersContent />
    </RoleGuard>
  );
}
