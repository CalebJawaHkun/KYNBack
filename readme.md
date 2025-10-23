Title: Google Auth + Local Auth  
Date: 10.23, 12:11PM  
Author: Caleb Jawa Hkun  
Version: 1.1.0  
Note: A simple Oauth/Local Auth project. Built with Express + Redis. Session and Credential storage both are handled by Redis. In this initial version, 4 endpoints are mounted mainly for Local signup/signin. Read the full doc below for detail on Endpoints.  

1️⃣ POST /auth/signup

Purpose: Create a new user account.
Session: Not yet tagged (until user logs in).

📥 Expected JSON Body
```
{
  "email": "user@example.com",
  "username": "Cal",
  "password": "secret123"
}
```

🧩 Logic

Check if email already exists in Redis.

If exists → reject.

Otherwise → hash password (bcrypt) and store:

Key: user:<email>

Value: JSON { id, email, username, hashedPassword }.

📤 Responses
| Status | Condition               | Example Response                        |
| ------ | ----------------------- | --------------------------------------- |
| `201`  | Signup successful       | `{ "message": "Signup successful" }`    |
| `409`  | Duplicate email         | `{ "message": "Email already exists" }` |
| `400`  | Missing/invalid fields  | `{ "message": "Invalid input" }`        |
| `500`  | Redis or bcrypt failure | `{ "message": "Server error" }`         |


Purpose: Authenticate existing user and tag session with their identity.

📥 Expected JSON Body
```
{
  "email": "user@example.com",
  "password": "secret123"
}```

🧩 Logic

Check if user:<email> exists in Redis.

If not → prompt signup.

Compare password with stored hash.

On success → tag session:

req.session.userId = user.id;
req.session.authType = "local";


(session cookie auto-sent to browser)

📤 Responses
| Status | Condition          | Example Response                                         |
| ------ | ------------------ | -------------------------------------------------------- |
| `200`  | Login success      | `{ "message": "Login successful" }`                      |
| `404`  | Email not found    | `{ "message": "Email not found, please sign up first" }` |
| `401`  | Invalid password   | `{ "message": "Incorrect password" }`                    |
| `400`  | Bad request body   | `{ "message": "Invalid input" }`                         |
| `500`  | Redis/bcrypt error | `{ "message": "Server error" }`                          |

3️⃣ GET /auth/status

Purpose: Check if current session corresponds to a logged-in user.
Frontend use: Page load + UI refresh.

🧩 Logic

If req.session.userId exists → logged in.

Otherwise → not logged in.

📤 Responses
| Status | Condition     | Example Response                                              |
| ------ | ------------- | ------------------------------------------------------------- |
| `200`  | Logged in     | `{ "loggedIn": true, "clientData": { "userId", "username", "email", "picture", "authType" } }` |
| `200`  | Not logged in | `{ "loggedIn": false, "clientData": null }`                                       |

4️⃣ POST /auth/logout

Purpose: Destroy session and clear cookie.
Future-proof for OAuth: Checks authType.

🧩 Logic

Read req.session.authType.

If "google" → later revoke token.

Destroy session from Redis.

Clear connect.sid cookie.

📤 Responses
| Status | Condition             | Example Response                           |
| ------ | --------------------- | ------------------------------------------ |
| `200`  | Logout success        | `{ "message": "Logged out successfully" }` |
| `500`  | Session destroy error | `{ "message": "Logout failed" }`           |

🧭 Overall Design Principles

Sessions: Redis-stored, automatically expiring, linked via connect.sid cookie.

Credentials: Redis key/value store (user:<email>).

Password Security: bcrypt hashing on signup, bcrypt compare on signin.

Frontend: Uses fetch with { credentials: 'include' } to preserve session cookie.

# Additional Google OAuth Endpoints Documentation

This document outlines the two additional Google OAuth endpoints for the authentication system.

---

## 1️⃣ Redirect to Google Consent Screen

**Endpoint:**

```
GET /auth/google
```

**Description:**
Redirects the user to Google's OAuth 2.0 consent screen to initiate the authentication process.

**Query Parameters:**

* None

**Response:**

* **Redirect** to Google's OAuth 2.0 consent URL

**Notes:**

* Uses `GOOGLE_CLIENT_ID` and `GOOGLE_REDIRECT_URI` from `.env`
* Requests scopes: `openid email profile`
* `prompt=consent` ensures user can choose account
* `access_type=offline` allows refresh token (optional)

**Example:**

```http
GET /auth/google
```

---

## 2️⃣ Google OAuth Callback

**Endpoint:**

```
GET /auth/google/callback
```

**Description:**
Handles the callback from Google OAuth, exchanges the authorization code for an access token, fetches user info, stores/retrieves user in Redis, and creates a session.

**Query Parameters:**

* `code` (string) - Authorization code returned from Google (on successful consent)
* `error` (string, optional) - Returned if user denies access

**Flow:**

1. Check for `error` query parameter:

   * If present (e.g., user denied consent), redirect to homepage.
2. Exchange `code` for `access_token` with Google token endpoint.
3. Fetch user info (`email`, `name`, `picture`) from Google.
4. Check Redis:

   * Key `user:google:<email>` exists → re-login
   * Key `user:local:<email>` exists → block (optional: handle account linking)
   * Otherwise → create new Google user record in Redis
5. Create session (`req.session.clientData`) with:

```json
{
  "userId": "...",
  "username": "...",
  "email": "...",
  "picture": "...",
  "authType": "google"
}
```

6. Redirect user to client profile page.

**Responses:**

* **Redirect:** `/profile` on success
* **Redirect:** `/` if user denied access
* **400:** If local account exists with same email
* **500:** Internal server error

**Notes:**

* Session cookie identifies logged-in state.
* User data in Redis persists; session destruction logs out user.
* Access and refresh tokens are **not stored** in Redis for security.

**Example:**

```http
GET /auth/google/callback?code=4/0AY0e-g6...
GET /auth/google/callback?error=access_denied
```
