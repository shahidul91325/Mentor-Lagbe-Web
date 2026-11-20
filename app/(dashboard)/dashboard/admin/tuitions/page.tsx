// "use client" directive to ensure client-side interactivity
"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { RoleGuard } from "@/components/auth/role-guard";
import type { Tuition } from "@/types";
import { fetchAdminTuitions, approveTuition, rejectTuition } from "@/lib/admin-tuitions";

/** Re‑usable status badge component */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-200 text-yellow-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
  };
  const label = status?.charAt(0).toUpperCase() + status?.slice(1);
  return (
    <Badge className={`px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-200 text-gray-800"}`}>{label}</Badge>
  );
}

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Load tuitions – stable callback so it can be used in useEffect deps
  const loadTuitions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminTuitions({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setTuitions(response.tuitions);
      const pages = Math.ceil(response.total / response.limit) || 1;
      setTotalPages(pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tuitions.");
      setTuitions([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  // Initial and reactive load – use a timer to avoid sync setState inside effect
  useEffect(() => {
    const timer = setTimeout(() => loadTuitions(), 0);
    return () => clearTimeout(timer);
  }, [loadTuitions]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") await approveTuition(id);
      else await rejectTuition(id);
      toast.success(`Tuition ${action}d`);
      await loadTuitions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${action} tuition`);
    }
  };

  const confirmAndHandle = (id: string, action: "approve" | "reject") => {
    const verb = action === "approve" ? "approve" : "reject";
    if (window.confirm(`Are you sure you want to ${verb} this tuition?`)) {
      handleAction(id, action);
    }
  };

  return (
    <RoleGuard allowed={["admin"]}>
      <Card>
        <CardHeader>
          <CardTitle>Admin – Tuition Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Previous</Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</Button>
              <Button variant="outline" onClick={loadTuitions} disabled={loading}>Refresh</Button>
            </div>
          </div>

          {loading && <TableSkeleton rows={5} />}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && tuitions.length === 0 && (
            <EmptyState title="No tuitions found" description="There are no tuition records matching the current filters." />
          )}

          {!loading && tuitions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Title</th>
                    <th className="px-4 py-2 text-left font-medium">Tutor</th>
                    <th className="px-4 py-2 text-left font-medium">Subject / Level</th>
                    <th className="px-4 py-2 text-left font-medium">Fee</th>
                    <th className="px-4 py-2 text-left font-medium">Created</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tuitions.map((t) => (
                    <tr key={t._id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium">{t.title}</td>
                      <td className="px-4 py-2">{t.tutorName} ({t.tutorEmail})</td>
                      <td className="px-4 py-2">{t.subject} / {t.classLevel}</td>
                      <td className="px-4 py-2">${t.monthlyFee}</td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2"><StatusBadge status={t.approvalStatus} /></td>
                      <td className="px-4 py-2">
                        {t.approvalStatus === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => confirmAndHandle(t._id, "approve")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => confirmAndHandle(t._id, "reject")}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
