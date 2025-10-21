Change Log KYNBack

## Versioin 1.0.1 - 2025/10/21

### Added
- In this version, the session now bears the user info after being authenticated. (Both on Signup/in). 
- The json format is
- "clientData": { "userId", "username", "email", "picture", "authType" }
- the format will stay consitent on both Local and Google OAuth.
### Changed 
- GET /status 
- The endpoint now uses the same "clientData" which gets mounted upon either signup/in.
- Added a guard clause to the endpoint that checks if the session has not already been mounted with "clientData".
