# Temporary Authentication Setup

## ✅ What Was Done

To allow you to use the website immediately while setting up AWS Cognito, I've created a temporary authentication system.

## 📁 Files Created/Updated

### Created:
1. ✅ `src/lib/tempAuth.ts` - Temporary localStorage-based authentication

### Updated:
1. ✅ `src/contexts/UserContext.tsx` - Uses temp auth (with TODO comments for Cognito)
2. ✅ `src/pages/auth/SignIn.tsx` - Uses temp auth (with TODO comments for Cognito)
3. ✅ `src/pages/auth/SignUp.tsx` - Uses temp auth (with TODO comments for Cognito)

## 🎯 How It Works Now

### Sign Up:
1. User fills form
2. Data stored in `localStorage` (key: `temp_users`)
3. Auto-login after signup
4. Redirect to dashboard

### Sign In:
1. User enters credentials
2. Checks `localStorage` for matching user
3. Stores current user in `localStorage` (key: `temp_current_user`)
4. Redirect to dashboard

### Session Persistence:
- On page refresh, checks `localStorage` for `temp_current_user`
- Auto-login if found

## 🚀 You Can Now:

✅ Sign up as user/counsellor  
✅ Sign in with created accounts  
✅ Access dashboards  
✅ Stay logged in on refresh  
✅ Sign out  

## 🔄 Switching to AWS Cognito Later

When you're ready to use AWS Cognito, simply:

### 1. Update `src/contexts/UserContext.tsx`:
```typescript
// Remove this line:
import { getTempCurrentUser, getTempUserAttributes, tempSignOut } from '@/lib/tempAuth';

// Uncomment this line:
import { getCognitoCurrentUser, getCognitoUserAttributes, cognitoSignOut } from '@/lib/cognito-auth';

// Then replace all temp functions with Cognito functions
```

### 2. Update `src/pages/auth/SignIn.tsx`:
```typescript
// Remove this line:
import { tempSignIn, getTempUserAttributes } from "@/lib/tempAuth";

// Uncomment this line:
import { cognitoSignIn, getCognitoUserAttributes } from "@/lib/cognito-auth";

// Then replace all temp functions with Cognito functions
```

### 3. Update `src/pages/auth/SignUp.tsx`:
```typescript
// Remove this line:
import { tempSignUp } from "@/lib/tempAuth";

// Uncomment this line:
import { cognitoSignUp, cognitoConfirmSignUp } from "@/lib/cognito-auth";

// Then replace all temp functions with Cognito functions
```

### 4. Delete temporary auth file:
```bash
rm src/lib/tempAuth.ts
```

## 📝 All TODO Comments

I've added `// TODO: Switch to Cognito once AWS is set up` comments in all files that need to be updated. Just search for "TODO" in your code editor to find them all.

## ⚠️ Important Notes

1. **Temporary Only**: This is for development. Don't use in production!
2. **No Security**: Passwords stored in plain text in localStorage
3. **No Validation**: Minimal password requirements (6+ chars)
4. **No Email Verification**: Accounts work immediately
5. **Browser Only**: Data lost if you clear browser storage

## 🧪 Testing

Try this now:

1. Go to `/auth/signup`
2. Sign up as a user (any email, any password 6+ chars)
3. You'll be auto-logged in and redirected to `/dashboard/user`
4. Sign out
5. Go to `/auth/signin`
6. Sign in with the same credentials
7. You're back in!

## 📚 Related Files

- `src/lib/tempAuth.ts` - Temporary auth implementation
- `src/lib/cognito-auth.ts` - Real Cognito auth (ready to use)
- `SECURE_SETUP_GUIDE.md` - How to set up AWS Cognito
- `AUTH_MIGRATION_SUMMARY.md` - Full auth migration details

---

**Status**: Website working with temporary auth ✅  
**Next Step**: Set up AWS Cognito when ready  
**Switch Time**: ~5 minutes (just uncomment code)
