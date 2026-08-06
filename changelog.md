Change Log KYNBack

## Version 1.0.1 - 2025/10/21

### Added

- In this version, the session now bears the user info after being authenticated. (Both on Signup/in).
- The json format is
- "clientData": { "userId", "username", "email", "picture", "authType" }
- the format will stay consitent on both Local and Google OAuth.

### Changed

- GET /status
- The endpoint now uses the same "clientData" which gets mounted upon either signup/in.
- Added a guard clause to the endpoint that checks if the session has not already been mounted with "clientData".

## Version 1.1.0 - 2025/10/23

- Added google OAuth2.0 login/signup functionality.
- Both OAuth and Local auth credentials can coexist with same email. ( User Credential merging is not implemented. )

### Added 

# Google OAuth2.0

- Added google OAuth Endpoints. Google OAuth2.0 login/signup is now enabled.
- Uses consent screen -> code -> access token -> client obj Flow.

### Changed

# Logout Logic

- Logout Functionality is now merged for both Local and Google.
- Logout ultimately destroys the session and delets client cookie for logout.
  
# Redis User Credential Hash Keys

- Local auth saves to hash key -> "user:local:<email>"
- Google auth saves to hash key -> "user:google:<email>"

# Redis User Credential Hash values

- Local auth saves to value keys as follows:

1. "userId"
2. "username"
3. "email"
4. "password"
  
- Google auth saves to hash key -> "user:google:<email>" 
1. "userId"
2. "username"
3. "email"
4. "picture"

- Thus the only change is "picture" and "password"

## Version 2.0.0 - 2026/8/6

### Added

1. Discord OAuth
2. Github OAuth

### Changed

- Undefined UserId fixed: Client geting 204 status from /status endpoint after OAuth Signin  is now fixed.
