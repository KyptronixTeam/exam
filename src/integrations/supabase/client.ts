// Shim that adapts existing frontend calls that expect a Supabase-like client
// to the custom backend REST API. This lets the frontend keep most existing
// code (calls to `supabase.auth.*`, `supabase.rpc`, and `supabase.from(..)`) while
// routing requests to our Express backend.

const API_BASE = import.meta.env.VITE_API_URL || '';

const sessionKey = 'app_session';
let _sessionTimer: number | null = null;

const setSessionTimer = (accessToken: string | undefined) => {
  // clear any existing timer
  if (_sessionTimer) {
    clearTimeout(_sessionTimer as any);
    _sessionTimer = null;
  }
  if (!accessToken) return;
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return;
    // base64 decode payload (handle URL-safe base64)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(json);
    if (payload && payload.exp) {
      const expiresAt = payload.exp * 1000;
      const ttl = expiresAt - Date.now();
      if (ttl > 0) {
        // add small buffer
        _sessionTimer = window.setTimeout(() => {
          // automatic sign out when token expires
          signOutLocal();
        }, ttl + 1000) as unknown as number;
      } else {
        // already expired -> sign out
        signOutLocal();
      }
    }
  } catch (e) {
    // ignore parse errors
  }
};

const clearSessionTimer = () => {
  if (_sessionTimer) {
    clearTimeout(_sessionTimer as any);
    _sessionTimer = null;
  }
};

const signOutLocal = () => {
  try {
    localStorage.removeItem(sessionKey);
    window.dispatchEvent(new CustomEvent('authStateChange', { detail: null }));
  } finally {
    clearSessionTimer();
  }
};

const saveSession = (session: any) => {
  localStorage.setItem(sessionKey, JSON.stringify(session));
  // set timer based on token exp
  setSessionTimer(session?.accessToken || session?.access_token || session?.accessToken);
  window.dispatchEvent(new CustomEvent('authStateChange', { detail: session }));
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const request = async (path: string, opts: RequestInit = {}) => {
  const url = API_BASE + path;
  const headers: Record<string,string> = opts.headers ? (opts.headers as any) : {};
  const sess = loadSession();
  if (sess && sess.accessToken) {
    headers['Authorization'] = `Bearer ${sess.accessToken}`;
    try {
      // avoid printing full token; show a masked preview for debugging
      const masked = typeof sess.accessToken === 'string' ? sess.accessToken.slice(0, 8) + '...' : 'present';
      // eslint-disable-next-line no-console
      console.debug('[supabase-shim] Using accessToken (masked):', masked, 'for', url);
    } catch (_) {}
  } else {
    // Only warn when attempting non-GET requests without an access token
    // (GET requests for public resources are common and shouldn't spam the console).
    const method = ((opts && (opts as any).method) || 'GET').toString().toUpperCase();
    if (method !== 'GET') {
      // eslint-disable-next-line no-console
      console.warn('[supabase-shim] No session/accessToken present for request to', url, 'method=', method);
    } else {
      // quieter debug-level message for unauthenticated GETs
      // eslint-disable-next-line no-console
      console.debug('[supabase-shim] Unauthenticated GET to', url);
    }
  }
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const res = await fetch(url, { ...opts, headers });
  const json = await res.json().catch(() => null);
  if (res.status === 401) {
    // If server indicates token invalid/expired, sign out locally to clear session
    // and notify listeners so UI can react.
    const code = json?.error?.code || (json && json.code) || null;
    if (code === 'INVALID_TOKEN' || code === 'UNAUTHORIZED') {
      // remove local session and notify
      signOutLocal();
    }
    throw json || new Error('Unauthorized');
  }
  if (!res.ok) throw json || new Error('Request failed');
  return json;
};

// Minimal RPC mapping
const rpc = async (name: string, params?: any) => {
  if (name === 'admin_exists') {
    const res = await request('/api/admin/exists', { method: 'GET' });
    return { data: res.data };
  }
  if (name === 'validate-answers') {
    const res = await request('/api/mcq/validate', { method: 'POST', body: JSON.stringify(params) });
    return { data: res.data };
  }
  if (name === 'mcq_config') {
    // Public endpoint, don't send auth
    const res = await fetch(API_BASE + '/api/mcq/config', { method: 'GET' });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw json || new Error('Request failed');
    return { data: json.data };
  }
  if (name === 'mcq_categories') {
    // Return canonical categories from backend
    const res = await request('/api/mcq/categories', { method: 'GET' });
    return { data: res.data };
  }
  if (name === 'get_setting') {
    const key = params?.key;
    if (!key) throw new Error('key required for get_setting');
    const res = await request(`/api/admin/settings/${key}`, { method: 'GET' });
    return { data: res.data };
  }
  if (name === 'update_setting') {
    const key = params?.key;
    const value = params?.value;
    if (!key) throw new Error('key required for update_setting');
    const res = await request(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
    return { data: res.data };
  }
  // Unknown RPC
  throw new Error('Unknown RPC ' + name);
};

// Minimal from() mapping for simple CRUD used across the app
// QueryBuilder provides a small chainable API similar to supabase.from(...)
class QueryBuilder {
  base: string;
  table: string;
  mapItem: (item: any) => any;
  _filters: Record<string, any> = {};
  _order?: { field: string; opts?: any };
  _limit?: number;
  _offset?: number;

  constructor(table: string, base: string, mapItem: (item: any) => any) {
    this.table = table;
    this.base = base;
    this.mapItem = mapItem;
  }

  select(_cols?: string) {
    // return this for chaining; actual request happens on eq() or when awaited
    return this;
  }

  // support eq chaining
  eq(field: string, value: any) {
    this._filters[field] = value;
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  range(from: number, to: number) {
    this._offset = from;
    this._limit = to - from + 1;
    return this;
  }

  order(field: string, opts?: any) {
    this._order = { field, opts };
    return this;
  }

  async exec() {
    // Special handling for user_roles table - just return success for compatibility
    if (this.table === 'user_roles') {
      console.warn('user_roles table operations are handled by user model roles field');
      // return a harmless default for insert/select
      return [];
    }

    // build query string from filters and order
    const params = new URLSearchParams();
    const filters = { ...this._filters };
    // Map frontend field names to backend for mcq_questions
    if (this.table === 'mcq_questions') {
      if ('subject' in filters) {
        filters.category = filters.subject;
        delete filters.subject;
      }
    }
    for (const k of Object.keys(filters)) {
      params.append(k, String(filters[k]));
    }
    if (this._order) {
      params.append('_order', this._order.field);
      if (this._order.opts && this._order.opts.ascending === false) params.append('_order_dir', 'desc');
    }
    if (this._limit) params.append('limit', String(this._limit));
    if (this._offset !== undefined) params.append('page', String(Math.floor(this._offset / (this._limit || 20)) + 1));
    const url = params.toString() ? `${this.base}?${params.toString()}` : this.base;
    const res = await request(url, { method: 'GET' });
    let rawData = res.data;
    // Handle paginated responses: if data has 'items', use that as the array
    if (rawData && typeof rawData === 'object' && 'items' in rawData && Array.isArray(rawData.items)) {
      rawData = rawData.items;
    }
    const data = Array.isArray(rawData) ? rawData.map(this.mapItem) : rawData;
    return { data, error: null };
  }

  // make the builder awaitable: await queryBuilder.select()
  then(resolve: any, reject: any) {
    return this.exec().then(resolve, reject);
  }
}

const from = (table: string) => {
  const base = (() => {
    switch (table) {
      case 'mcq_questions': return '/api/mcq';
      case 'submissions': return '/api/submissions';
      case 'user_roles': return '/api/users';
      default: return '/' + table; // fallback
    }
  })();

  const mapItem = (item: any) => {
    // Map backend resources to the original frontend shape when possible
    if (table === 'mcq_questions') {
      return {
        id: item._id || item.id || item._id,
        subject: item.category || item.subject || null,
        question: item.question,
        options: item.options,
        correct_answer: item.correctAnswer ?? item.correct_answer,
        created_at: item.createdAt || item.created_at
      };
    }
    if (table === 'submissions') {
      return item; // submission shape should be compatible or handled in components
    }
    return item;
  };

  const handlers: any = {
    select: (cols?: string) => new QueryBuilder(table, base, mapItem).select(cols),
    async insert(payload: any) {
      if (table === 'user_roles') {
        const userId = payload.user_id || payload.userId || payload.user_id;
        const role = payload.role;
        if (!userId || !role) throw new Error('invalid payload for user_roles');
        const res = await request(`${base}/${userId}/roles`, { method: 'POST', body: JSON.stringify({ roles: [role] }) });
        return { data: res.data, error: null };
      }
      // Handle bulk insert for mcq_questions
      if (table === 'mcq_questions' && Array.isArray(payload)) {
        const res = await request(`${base}/bulk`, { method: 'POST', body: JSON.stringify({ questions: payload }) });
        return { data: res.data, error: null };
      }
      // map payload keys for mcq_questions
      if (table === 'mcq_questions') {
        const body = {
          question: payload.question,
          options: payload.options,
          correctAnswer: payload.correct_answer || payload.correctAnswer,
          category: payload.subject || payload.category
        };
        const res = await request(base, { method: 'POST', body: JSON.stringify(body) });
        return { data: res.data, error: null };
      }
      const res = await request(base, { method: 'POST', body: JSON.stringify(payload) });
      return { data: res.data, error: null };
    },
    delete() {
      return {
        eq: async (field: string, value: any) => {
          if (field !== 'id') throw new Error('Only id eq supported in shim');
          await request(`${base}/${value}`, { method: 'DELETE' });
          return { error: null };
        }
      };
    },
    order(field: string, opts?: any) {
      // return a QueryBuilder to support chaining order() after select()
      const qb = new QueryBuilder(table, base, mapItem);
      return qb.order(field, opts);
    }
  };

  return handlers;
};

// Auth shim
const auth = {
  async signUp(payload: any) {
    const body = { email: payload.email, password: payload.password, fullName: payload.fullName || payload.options?.data?.fullName || '' };
    const res = await request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
    const session = { user: res.data.user, access_token: res.data.accessToken, refresh_token: res.data.refreshToken };
    saveSession({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken, user: res.data.user });
    return { data: { user: res.data.user }, error: null };
  },
  async signInWithPassword({ email, password }: { email: string, password: string }) {
    const res = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    saveSession({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken, user: res.data.user });
    return { data: { user: res.data.user }, error: null };
  },
  async signInWithOtp({ phone }: { phone: string }) {
    const res = await request('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
    return { data: res.data, error: null };
  },
  async verifyOtp({ phone, otp }: { phone: string, otp: string }) {
    const res = await request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) });
    saveSession({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken, user: res.data.user });
    return { data: { user: res.data.user }, error: null };
  },
  getSession() {
    const sess = loadSession();
    return Promise.resolve({ data: { session: sess } });
  },
  onAuthStateChange(cb: (event: any, session: any) => void) {
    const listener = (e: any) => cb('SIGNED_IN', e.detail);
    window.addEventListener('authStateChange', listener as EventListener);
    const subscription = { unsubscribe() { window.removeEventListener('authStateChange', listener as EventListener); } };
    // Return shape compatible with Supabase: { data: { subscription } }
    return { data: { subscription } };
  },
  async signOut() {
    signOutLocal();
    return { error: null };
  }
};

export const supabase = { auth, rpc, from };
