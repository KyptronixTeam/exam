// Direct client for the Node.js/Express + MongoDB backend.
// Replaces the old Supabase shim — all requests go straight to the REST API.

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5112";

const SESSION_KEY = "app_session";

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

let sessionTimer: number | null = null;

const clearSessionTimer = () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
};

// Auto sign-out when the JWT expires
const setSessionTimer = (accessToken?: string) => {
  clearSessionTimer();
  if (!accessToken) return;
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload?.exp) {
      const ttl = payload.exp * 1000 - Date.now();
      if (ttl > 0) {
        sessionTimer = window.setTimeout(() => clearAuthSession(), ttl + 1000);
      } else {
        clearAuthSession();
      }
    }
  } catch {
    // ignore token parse errors
  }
};

export const getAuthSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setSessionTimer(session.accessToken);
  window.dispatchEvent(new CustomEvent("authStateChange", { detail: session }));
};

export const clearAuthSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent("authStateChange", { detail: null }));
  } finally {
    clearSessionTimer();
  }
};

export const onAuthStateChange = (cb: (session: AuthSession | null) => void) => {
  const listener = (e: any) => cb(e.detail);
  window.addEventListener("authStateChange", listener as EventListener);
  return () => window.removeEventListener("authStateChange", listener as EventListener);
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Core fetch wrapper: attaches the bearer token when present, parses the
 * standard `{ success, data, error }` envelope and throws ApiError on failure.
 */
export const apiFetch = async (path: string, opts: RequestInit = {}): Promise<any> => {
  const headers: Record<string, string> = { ...(opts.headers as any) };
  const session = getAuthSession();
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_BASE_URL + path, { ...opts, headers });
  const json = await res.json().catch(() => null);

  if (res.status === 401) {
    const code = json?.error?.code;
    if (code === "INVALID_TOKEN" || code === "UNAUTHORIZED") {
      clearAuthSession();
    }
    throw new ApiError(401, json?.error?.message || "Session expired. Please log in again.", code);
  }
  if (!res.ok || (json && json.success === false)) {
    throw new ApiError(res.status, json?.error?.message || "Request failed", json?.error?.code);
  }
  return json?.data ?? json;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  async login(email: string, password: string) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuthSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    return data.user;
  },

  async register(email: string, password: string, fullName = "") {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
    saveAuthSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    return data.user;
  },

  /** Fetch the current user from the backend (validates the token). */
  async getUser() {
    const session = getAuthSession();
    if (!session?.accessToken) return null;
    try {
      const data = await apiFetch("/api/users/me");
      return data.user;
    } catch {
      return null;
    }
  },

  getSession: getAuthSession,

  signOut() {
    clearAuthSession();
  },
};

// ---------------------------------------------------------------------------
// MCQ questions
// ---------------------------------------------------------------------------
export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number | string;
  correct_answer_text?: string;
  subject?: string;
  category?: string;
  difficulty?: string;
  points?: number;
  questionSet?: number;
}

export const mcqApi = {
  async listQuestions(params: { category?: string; questionSet?: number; difficulty?: string; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.questionSet) qs.set("questionSet", String(params.questionSet));
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    qs.set("limit", String(params.limit ?? 500));
    const data = await apiFetch(`/api/mcq?${qs.toString()}`);
    return (data.items || []) as McqQuestion[];
  },

  /** Available question sets for a category: [{ set: 1, count: 30 }, ...] */
  async listSets(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    const data = await apiFetch(`/api/mcq/sets${qs}`);
    return (data.sets || []) as Array<{ set: number; count: number }>;
  },

  async listCategories(): Promise<string[]> {
    const data = await apiFetch("/api/mcq/categories");
    return data.categories || [];
  },

  async getConfig(): Promise<{ passingPercentage: number }> {
    return apiFetch("/api/mcq/config");
  },

  async validateAnswers(answers: Array<{ questionId: string; selectedAnswer: string | null }>) {
    return apiFetch("/api/mcq/validate", { method: "POST", body: JSON.stringify({ answers }) });
  },

  async createQuestion(payload: any) {
    return apiFetch("/api/mcq", { method: "POST", body: JSON.stringify(payload) });
  },

  async bulkCreateQuestions(questions: any[]) {
    return apiFetch("/api/mcq/bulk", { method: "POST", body: JSON.stringify({ questions }) });
  },

  async deleteQuestion(id: string) {
    return apiFetch(`/api/mcq/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Submissions (admin)
// ---------------------------------------------------------------------------
export const submissionsApi = {
  async list(params: Record<string, string | number | boolean | undefined>) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    return apiFetch(`/api/submissions?${qs.toString()}`);
  },

  async getById(id: string) {
    const data = await apiFetch(`/api/submissions/${id}`);
    return data.submission;
  },

  async toggleShortlist(id: string) {
    return apiFetch(`/api/submissions/${id}/shortlist`, { method: "PATCH" });
  },
};

// ---------------------------------------------------------------------------
// Admin / settings
// ---------------------------------------------------------------------------
export const adminApi = {
  async adminExists(): Promise<boolean> {
    const data = await apiFetch("/api/admin/exists");
    return typeof data === "boolean" ? data : !!(data?.exists ?? data);
  },

  async statistics() {
    return apiFetch("/api/admin/statistics");
  },

  async getSetting(key: string) {
    return apiFetch(`/api/admin/settings/${key}`);
  },

  async updateSetting(key: string, value: any) {
    return apiFetch(`/api/admin/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) });
  },

  async assignRole(userId: string, role: string) {
    return apiFetch(`/api/users/${userId}/roles`, { method: "POST", body: JSON.stringify({ roles: [role] }) });
  },

  async updateSecurity(payload: { email?: string; newPassword?: string }) {
    return apiFetch("/api/users/me/security", { method: "PUT", body: JSON.stringify(payload) });
  },
};
