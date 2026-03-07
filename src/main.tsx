import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";

// Configure AWS Amplify with Cognito
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
            identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || "",
            loginWith: { email: true },
            signUpVerificationMethod: "code",
            userAttributes: {
                email: { required: true },
                name: { required: true },
            },
            allowGuestAccess: false,
            passwordFormat: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireNumbers: true,
                requireSpecialCharacters: true,
            },
        },
    },
});

createRoot(document.getElementById("root")!).render(<App />);
