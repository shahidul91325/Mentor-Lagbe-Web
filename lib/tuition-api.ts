import { apiFetch } from '@/lib/api';
import type { Tuition } from '@/types';

// Public: fetch approved and active tuitions
export async function fetchTuitions(): Promise<Tuition[]> {
  const data = await apiFetch<Tuition[]>('/api/tuitions');
  return data;
}

// Public/authenticated: fetch single tuition details by ID
export async function fetchTuitionById(id: string): Promise<Tuition> {
  const result = await apiFetch<{ tuition: Tuition } | Tuition>(`/api/tuitions/${id}`);
  if (result && typeof result === 'object' && 'tuition' in result && result.tuition) {
    return result.tuition;
  }
  return result as Tuition;
}

// Tutor: fetch own tuitions (requires token)
export async function fetchMyTuitions(token: string): Promise<Tuition[]> {
  // No dedicated endpoint – using general GET with token and filter client‑side
  const all = await apiFetch<Tuition[]>('/api/tuitions', { token });
  // The backend returns only approved/active; for tutor we need all, so we assume a new endpoint exists.
  // For now, fallback to the same list.
  return all;
}

export async function createTuition(token: string, payload: Omit<Tuition, '_id' | 'status' | 'active' | 'createdAt' | 'updatedAt'>): Promise<Tuition> {
  const data = await apiFetch<Tuition>('/api/tuitions', {
    method: 'POST',
    token,
    body: payload,
  });
  return data;
}

export async function updateTuition(token: string, id: string, payload: Partial<Omit<Tuition, '_id'>>): Promise<Tuition> {
  const data = await apiFetch<Tuition>(`/api/tuitions/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
  return data;
}

export async function deleteTuition(token: string, id: string): Promise<void> {
  await apiFetch<void>(`/api/tuitions/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function changeTuitionStatus(token: string, id: string, status: 'approved' | 'rejected'): Promise<Tuition> {
  const data = await apiFetch<Tuition>(`/api/tuitions/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
  return data;
}

/** Student: bookmark a tuition. */
export async function addBookmark(token: string, tuitionId: string): Promise<{ saved: boolean; savedTuitionIds?: string[]; limitReached?: boolean; limit?: number; message?: string }> {
  return apiFetch<{ saved: boolean; savedTuitionIds?: string[]; limitReached?: boolean; limit?: number; message?: string }>(`/api/tuitions/${tuitionId}/bookmark`, {
    method: 'POST',
    token,
  });
}

/** Student: remove a bookmark. */
export async function removeBookmark(token: string, tuitionId: string): Promise<{ saved: boolean; savedTuitionIds?: string[]; message?: string }> {
  return apiFetch<{ saved: boolean; savedTuitionIds?: string[]; message?: string }>(`/api/tuitions/${tuitionId}/bookmark`, {
    method: 'DELETE',
    token,
  });
}

/** Student: list saved (bookmarked) tuitions. */
export interface SavedTuitionsResponse {
  savedTuitions: Tuition[];
  total: number;
  savedTuitionIds: string[];
  limit: number;
  plan: 'free' | 'pro';
  unlimited: boolean;
}

export async function fetchSavedTuitions(token: string): Promise<SavedTuitionsResponse> {
  return apiFetch<SavedTuitionsResponse>('/api/tuitions/bookmarks/saved', { token });
}

/** Tutor: activate or close their own tuition. */
export async function toggleTuitionActive(token: string, id: string, isActive: boolean): Promise<Tuition> {
  const data = await apiFetch<{ tuition: Tuition; message: string }>(`/api/tuitions/${id}/active`, {
    method: 'PATCH',
    token,
    body: { isActive },
  });
  return data.tuition;
}
