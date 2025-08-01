# Security TODOs for Firebase Integration

## Critical Security Issues to Address Before Production

### 1. Authentication Required
- Add user authentication before saving blueprints
- Associate each blueprint with a userId
- Implement proper login flow

### 2. Firestore Security Rules
Currently blueprints are publicly accessible. Need to update rules:
```javascript
// firestore.rules
match /blueprints/{blueprintId} {
  // Only allow reading if user owns it OR it's marked as shared
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId || resource.data.isShared == true);
  
  // Only allow writing if user owns it
  allow write: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
}
```

### 3. Environment Variables
Ensure Firebase config uses consistent environment variable prefixes:
- Vite uses: `VITE_FIREBASE_API_KEY`
- Not: `REACT_APP_FIREBASE_API_KEY`

### 4. Input Validation
Add validation for all blueprint data before saving:
- Sanitize user input
- Validate required fields
- Check data size limits

## Notes
These security issues are acceptable for development/testing with a single user, but MUST be addressed before any public deployment.