type Role = 'user' | 'counsellor' | 'admin';

// Use VITE_API_BASE_URL if provided, otherwise default to empty string for relative paths (Vite proxy)
const RAW_BASE = (import.meta.env as any).VITE_API_BASE_URL as string | undefined;
let BASE = RAW_BASE || '';

// Clean up BASE trailing slashes if it's an absolute URL
if (BASE && BASE.startsWith('http')) {
  try {
    const u = new URL(BASE);
    if (!u.port && u.protocol === 'http:') u.port = '8083';
    BASE = u.toString().replace(/\/$/, '');
  } catch {
    BASE = 'http://127.0.0.1:8083';
  }
}

export interface ApiAuthResponse {
  email: string;
  localId: string;
  displayName?: string;
  role?: Role;
}

/**
 * Safely reads the response body as text first, then parses JSON.
 * This prevents "Unexpected end of JSON input" when the server returns
 * an empty body (e.g. 502 proxy error when the backend is not running).
 */
const handle = async (res: Response): Promise<ApiAuthResponse> => {
  let text = '';
  try {
    text = await res.text();
  } catch {
    throw new Error('No response from server. Make sure the backend server is running.');
  }

  // Try to parse the body as JSON
  let data: any = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned an invalid response (status ${res.status}). Please try again.`);
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Server error (${res.status}). Please try again.`);
  }

  if (!data) {
    throw new Error('Empty response from server. Make sure the backend server is running on port 8083.');
  }

  return data as ApiAuthResponse;
};

export const signUpWithEmailPassword = async (
  name: string,
  email: string,
  password: string,
  role: 'user' | 'counsellor'
): Promise<ApiAuthResponse> => {
  let res: Response;
  try {
    res = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
  } catch {
    throw new Error('Cannot connect to the server. Please start the backend: run "npm start" inside the /server folder.');
  }
  return handle(res);
};

export const signInWithEmailPassword = async (
  email: string,
  password: string,
  role: Role
): Promise<ApiAuthResponse> => {
  let res: Response;
  try {
    res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
  } catch {
    throw new Error('Cannot connect to the server. Please start the backend: run "npm start" inside the /server folder.');
  }
  return handle(res);
};