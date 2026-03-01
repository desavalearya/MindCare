interface LocalUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'counsellor' | 'admin';
}

export interface LocalAuthResponse {
  idToken?: string; // not used locally
  email: string;
  refreshToken?: string;
  expiresIn?: string;
  localId: string;
  displayName?: string;
}

const STORAGE_KEY = 'mindmate_users';

const readUsers = (): LocalUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalUser[]) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: LocalUser[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
};

export const signUpWithEmailPassword = async (
  name: string,
  email: string,
  password: string,
  role: 'user' | 'counsellor'
): Promise<LocalAuthResponse> => {
  const users = readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error('Email already registered');
  }
  const user: LocalUser = { name, email, password, role };
  writeUsers([...users, user]);
  return {
    email,
    localId: `local:${email}`,
    displayName: name,
  };
};

export const signInWithEmailPassword = async (
  email: string,
  password: string,
  role?: 'user' | 'counsellor' | 'admin'
): Promise<LocalAuthResponse> => {
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('Account not found');
  }
  if (role && user.role !== role) {
    throw new Error(`Account exists but role is ${user.role}`);
  }
  if (user.password !== password) {
    throw new Error('Invalid credentials');
  }
  return {
    email: user.email,
    localId: `local:${user.email}`,
    displayName: user.name,
  };
};