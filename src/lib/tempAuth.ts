// Temporary authentication - bypasses AWS Cognito for development
// TODO: Remove this file once AWS Cognito is set up

export interface TempAuthResponse {
  success: boolean;
  user?: {
    userId: string;
    username: string;
  };
  tokens?: {
    accessToken: string;
    idToken: string;
  };
}

export interface TempUserAttributes {
  email: string;
  name: string;
  role: 'user' | 'counsellor' | 'admin';
  emailVerified: boolean;
}

// Temporary sign up - just stores in localStorage
export const tempSignUp = async (params: {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'counsellor' | 'admin';
}): Promise<TempAuthResponse> => {
  try {
    const users = JSON.parse(localStorage.getItem('temp_users') || '[]');
    
    // Check if user exists
    if (users.find((u: any) => u.email === params.email)) {
      throw new Error('User already exists');
    }

    // Add user
    users.push({
      email: params.email,
      password: params.password,
      name: params.name,
      role: params.role || 'user',
    });

    localStorage.setItem('temp_users', JSON.stringify(users));

    return {
      success: true,
      user: {
        userId: `temp-${Date.now()}`,
        username: params.email,
      },
    };
  } catch (error: any) {
    throw new Error(error.message || 'Sign up failed');
  }
};

// Temporary sign in - checks localStorage
export const tempSignIn = async (params: {
  email: string;
  password: string;
}): Promise<TempAuthResponse> => {
  try {
    const users = JSON.parse(localStorage.getItem('temp_users') || '[]');
    const user = users.find((u: any) => u.email === params.email && u.password === params.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Store current user
    localStorage.setItem('temp_current_user', JSON.stringify(user));

    return {
      success: true,
      user: {
        userId: `temp-${user.email}`,
        username: user.email,
      },
      tokens: {
        accessToken: 'temp-token',
        idToken: 'temp-token',
      },
    };
  } catch (error: any) {
    throw new Error(error.message || 'Sign in failed');
  }
};

// Temporary sign out
export const tempSignOut = async () => {
  localStorage.removeItem('temp_current_user');
  return { success: true };
};

// Get current user
export const getTempCurrentUser = async () => {
  const user = localStorage.getItem('temp_current_user');
  if (!user) return null;

  const userData = JSON.parse(user);
  return {
    userId: `temp-${userData.email}`,
    username: userData.email,
    signInDetails: {},
    tokens: {
      accessToken: 'temp-token',
      idToken: 'temp-token',
    },
  };
};

// Get user attributes
export const getTempUserAttributes = async (): Promise<TempUserAttributes | null> => {
  const user = localStorage.getItem('temp_current_user');
  if (!user) return null;

  const userData = JSON.parse(user);
  return {
    email: userData.email,
    name: userData.name,
    role: userData.role || 'user',
    emailVerified: true,
  };
};
