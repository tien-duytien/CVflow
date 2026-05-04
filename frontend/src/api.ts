const BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ?? 'http://localhost:8080/CVflow';

interface LoginResponse {
  success: boolean;
  user?: {
    userId: number;
    email: string;
    role: string;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/backend/auth.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as LoginResponse;
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}

export async function apiRequestPasswordReset(email: string) {
  const res = await fetch(`${BASE_URL}/backend/forgot_password.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request_reset', email }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to request password reset');
  }
  return data;
}

export async function apiResetPassword(token: string, newPassword: string) {
  const res = await fetch(`${BASE_URL}/backend/forgot_password.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset_password', token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to reset password');
  }
  return data;
}

export async function apiRegister(email: string, password: string, role: string): Promise<RegisterResponse> {
  const res = await fetch(`${BASE_URL}/backend/register.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, role }),
  });
  const data = (await res.json()) as RegisterResponse;
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function apiFetchCv(userId: number) {
  const res = await fetch(`${BASE_URL}/backend/cv.php?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error('Failed to load CV');
  }
  return res.json();
}

export async function apiFetchAllCvs() {
  const res = await fetch(`${BASE_URL}/backend/cv.php?all=1`);
  if (!res.ok) {
    throw new Error('Failed to load CVs');
  }
  return res.json();
}

export interface CvSearchParams {
  q?: string;
  categoryId?: number;
  countryId?: number;
  cityId?: number;
  skillIds?: number[];
  minProficiencyId?: number;
  degreeLevelId?: number;
  institutionId?: number;
  sort?: 'recent' | 'alpha' | 'experience';
  page?: number;
  pageSize?: number;
}

export async function apiSearchCvs(params: CvSearchParams) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.categoryId) search.set('categoryId', String(params.categoryId));
  if (params.countryId) search.set('countryId', String(params.countryId));
  if (params.cityId) search.set('cityId', String(params.cityId));
  if (params.degreeLevelId) search.set('degreeLevelId', String(params.degreeLevelId));
  if (params.institutionId) search.set('institutionId', String(params.institutionId));
  if (params.minProficiencyId) search.set('minProficiencyId', String(params.minProficiencyId));
  if (params.sort) search.set('sort', params.sort);
  if (params.skillIds && params.skillIds.length > 0) {
    params.skillIds.forEach((id) => {
      search.append('skillIds[]', String(id));
    });
  }
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));

  const res = await fetch(`${BASE_URL}/backend/search_cvs.php?${search.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to search CVs');
  }
  return res.json();
}

export async function apiSaveCv(payload: any) {
  const res = await fetch(`${BASE_URL}/backend/cv.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to save CV');
  }
  return data;
}

export async function apiGetLookup(type: string, params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  search.set('type', type);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) search.set(key, String(value));
    });
  }
  const res = await fetch(`${BASE_URL}/backend/lookups.php?${search.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load lookup: ${type}`);
  }
  return res.json();
}

export interface AdminUser {
  userId: number;
  name: string;
  email: string;
  role: 'seeker' | 'employer' | 'admin' | string;
  cvCount: number;
  isActive: boolean | null;
  createdAt: string | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  summary: {
    totalUsers: number;
    activeUsers: number;
    admins: number;
    employers: number;
    seekers: number;
    activeCvs: number;
  };
}

export async function apiFetchAdminUsers(params?: { q?: string; role?: string }) {
  const search = new URLSearchParams();
  if (params?.q && params.q.trim() !== '') {
    search.set('q', params.q.trim());
  }
  if (params?.role && params.role.trim() !== '') {
    search.set('role', params.role.trim());
  }

  const query = search.toString();
  const res = await fetch(`${BASE_URL}/backend/admin_users.php${query ? `?${query}` : ''}`);
  const data = (await res.json()) as AdminUsersResponse;

  if (!res.ok) {
    const msg =
      (data as unknown as { error?: string })?.error || 'Failed to load admin users';
    throw new Error(msg);
  }

  return data;
}

export type AdminLookupType =
  | 'skills'
  | 'categories'
  | 'degree-levels'
  | 'majors'
  | 'industries'
  | 'employment-types'
  | 'certificates'
  | 'countries'
  | 'cities'
  | 'districts';

export interface AdminLookupItem {
  id: number;
  name: string;
  parentId: number | null;
}

interface AdminLookupListResponse {
  type: AdminLookupType;
  items: AdminLookupItem[];
  meta: {
    parentType: AdminLookupType | null;
    parentRequired: boolean;
  };
}

export async function apiFetchAdminLookup(
  type: AdminLookupType,
  params?: { parentId?: number },
) {
  const search = new URLSearchParams();
  search.set('type', type);
  if (params?.parentId) {
    search.set('parentId', String(params.parentId));
  }
  const res = await fetch(`${BASE_URL}/backend/admin_lookups.php?${search.toString()}`);
  const data = (await res.json()) as AdminLookupListResponse;
  if (!res.ok) {
    const msg = (data as unknown as { error?: string })?.error || 'Failed to load lookup values';
    throw new Error(msg);
  }
  return data;
}

export async function apiCreateAdminLookup(payload: {
  type: AdminLookupType;
  name: string;
  parentId?: number;
}) {
  const res = await fetch(`${BASE_URL}/backend/admin_lookups.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { success?: boolean; item?: AdminLookupItem; error?: string };
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create lookup value');
  }
  return data;
}

export async function apiUpdateAdminLookup(payload: {
  type: AdminLookupType;
  id: number;
  name: string;
  parentId?: number;
}) {
  const res = await fetch(`${BASE_URL}/backend/admin_lookups.php`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { success?: boolean; item?: AdminLookupItem; error?: string };
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update lookup value');
  }
  return data;
}

export async function apiDeleteAdminLookup(payload: { type: AdminLookupType; id: number }) {
  const search = new URLSearchParams();
  search.set('type', payload.type);
  search.set('id', String(payload.id));
  const res = await fetch(`${BASE_URL}/backend/admin_lookups.php?${search.toString()}`, {
    method: 'DELETE',
  });
  const data = (await res.json()) as { success?: boolean; error?: string };
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete lookup value');
  }
  return data;
}

