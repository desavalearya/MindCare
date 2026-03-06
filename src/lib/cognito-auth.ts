// Cognito Authentication Service
import { 
  signUp, 
  signIn, 
  signOut, 
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  type SignUpInput,
  type SignInInput,
} from 'aws-amplify/auth';

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'counsellor' | 'admin';
}

export interface SignInParams {
  email: string;
  password: string;
}

// Sign up new user
export const cognitoSignUp = async ({ email, password, name, role = 'user' }: SignUpParams) => {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
          'custom:role': role,
        },
        autoSignIn: true,
      },
    });

    return {
      success: true,
      userId,
      isSignUpComplete,
      nextStep,
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Sign up failed');
  }
};

// Confirm sign up with verification code
export const cognitoConfirmSignUp = async (email: string, code: string) => {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return {
      success: true,
      isSignUpComplete,
      nextStep,
    };
  } catch (error: any) {
    console.error('Confirm sign up error:', error);
    throw new Error(error.message || 'Verification failed');
  }
};

// Sign in user
export const cognitoSignIn = async ({ email, password }: SignInParams) => {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password,
    });

    if (isSignedIn) {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      return {
        success: true,
        user: {
          userId: user.userId,
          username: user.username,
        },
        tokens: {
          accessToken: session.tokens?.accessToken?.toString(),
          idToken: session.tokens?.idToken?.toString(),
        },
      };
    }

    return {
      success: false,
      nextStep,
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Sign in failed');
  }
};

// Sign out user
export const cognitoSignOut = async () => {
  try {
    await signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Sign out failed');
  }
};

// Get current authenticated user
export const getCognitoCurrentUser = async () => {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    
    return {
      userId: user.userId,
      username: user.username,
      signInDetails: user.signInDetails,
      tokens: {
        accessToken: session.tokens?.accessToken?.toString(),
        idToken: session.tokens?.idToken?.toString(),
      },
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Get user attributes (including custom role)
export const getCognitoUserAttributes = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    
    if (idToken) {
      const payload = idToken.payload;
      return {
        email: payload.email as string,
        name: payload.name as string,
        role: payload['custom:role'] as string || 'user',
        emailVerified: payload.email_verified as boolean,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get user attributes error:', error);
    return null;
  }
};

// Reset password - request code
export const cognitoResetPassword = async (email: string) => {
  try {
    const output = await resetPassword({ username: email });
    return {
      success: true,
      nextStep: output.nextStep,
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw new Error(error.message || 'Password reset failed');
  }
};

// Confirm password reset with code
export const cognitoConfirmResetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Confirm reset password error:', error);
    throw new Error(error.message || 'Password reset confirmation failed');
  }
};

// Get JWT token for API calls
export const getCognitoToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};
