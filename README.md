MINDMATE
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Project name:MindMate
Project abstract:Mindmate is an AI-powered application that enables people to talk to it while also running in the background to track their moods 24/7. It records short audio snippets (less than a minute) at regular intervals for higher accuracy. A monthly report is then generated and shared with the customer’s counsellor for better insights and support.
Tech stack:Python,React js,Css ,TypeScript
 
Environment Setup
-----------------
- No Firebase configuration is required. The app uses local email/password authentication stored in `localStorage`.
- Optional: clear browser `localStorage` to reset local accounts.
 - Backend API: set `VITE_API_BASE_URL` if needed (default `http://127.0.0.1:8083`). If no port is provided, the frontend normalizes to `:8083`.

Smartwatch Integration (Google Fit)
-----------------------------------
- Add to `.env`:
  - `SMARTWATCH_GOOGLE_CLIENT_ID`
  - `SMARTWATCH_GOOGLE_CLIENT_SECRET`
  - `SMARTWATCH_GOOGLE_REDIRECT_URI` (default `http://127.0.0.1:8083/smartwatch/google/callback`)
- Backend endpoints (FastAPI running on `127.0.0.1:8083`):
  - `GET /smartwatch/google/auth_url` – returns consent URL
  - `GET /smartwatch/google/callback?code=...` – exchanges code for tokens
  - `GET /smartwatch/google/activities?access_token=...` – fetches recent sessions
- Frontend adds a “Connect Smartwatch” button on Wellness page to start OAuth.
