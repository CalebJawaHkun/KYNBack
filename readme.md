Title: Initial Local Auth
Date: 10.17, 6:44PM
Author: Caleb Jawa Hkun
Version: 1.0.0
Note: A simple Oauth/Local Auth project. Built with Express + Redis. Session and Credential storage both are handled by Redis. In this initial version, 4 endpoints are mounted mainly for Local signup/signin. Read the full doc below for detail on Endpoints.

1️⃣ POST /auth/signup

Purpose: Create a new user account.
Session: Not yet tagged (until user logs in).

📥 Expected JSON Body
{
  "email": "user@example.com",
  "username": "Cal",
  "password": "secret123"
}

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
{
  "email": "user@example.com",
  "password": "secret123"
}

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
| `200`  | Logged in     | `{ "loggedIn": true, "userId": "<id>", "authType": "local" }` |
| `200`  | Not logged in | `{ "loggedIn": false }`                                       |

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

Auth flow:

/signup → create user

/signin → create session

/status → check auth state

/logout → clear everything