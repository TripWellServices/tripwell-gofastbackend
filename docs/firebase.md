# 🔥 **FIREBASE AUTH ARCHITECTURE**

## **Overview**
Firebase Authentication handles user identity and session management. All user auth flows go through Firebase, then sync to our backend.

## **Firebase Setup**

### **Configuration**
```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### **Firebase Google Provider**
```javascript
// Firebase handles Google OAuth integration
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();
// Firebase manages the Google OAuth flow - we just use Firebase's wrapper
```

## **Auth Flow Architecture**

### **1. Home.jsx - Auth Check**
```javascript
// Entry point - checks if user is authenticated
auth.onAuthStateChanged((firebaseUser) => {
  if (firebaseUser) {
    navigate("/localrouter"); // Existing user
  } else {
    navigate("/signup"); // New user
  }
});
```

### **2. Signup.jsx - New User Registration**
```javascript
// Google signup popup
const result = await signInWithPopup(auth, googleProvider);
const user = result.user;

// Create user in backend
await fetch(`${BACKEND_URL}/tripwell/user/createOrFind`, {
  method: "POST",
  body: JSON.stringify({
    firebaseId: user.uid,
    email: user.email,
  }),
});

// Save to localStorage and route to ProfileSetup
localStorage.setItem("userData", JSON.stringify({
  firebaseId: user.uid,
  email: user.email,
  firstName: null,
  lastName: null,
  hometownCity: null
}));
navigate("/profilesetup");
```

### **3. ReturningUserSignin.jsx - Existing User Sign In**
```javascript
// Google signin popup
const result = await signInWithPopup(auth, googleProvider);
const user = result.user;

// Hydrate user data from backend
const response = await fetch(`${BACKEND_URL}/tripwell/hydrate`);
const data = await response.json();

// Save full user data to localStorage
localStorage.setItem("userData", JSON.stringify(data.userData));
navigate("/localrouter");
```

## **Backend Integration**

### **Firebase Token Verification**
```javascript
// middleware/verifyFirebaseToken.js
const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### **Axios Interceptor (Frontend)**
```javascript
// utils/auth.js
import { auth } from '../firebase';

axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## **Data Flow**

### **New User Flow**
```
1. Home → Firebase auth check → No user
2. Signup → Google popup → Firebase user created
3. Backend → Create TripWellUser with minimal data
4. Frontend → Save to localStorage
5. Route → ProfileSetup
```

### **Existing User Flow**
```
1. Home → Firebase auth check → User exists
2. LocalUniversalRouter → Hydrate from backend
3. Route → Appropriate page based on data
```

### **Returning User Sign In**
```
1. ReturningUserSignin → Google popup → Firebase auth
2. Backend → Find existing TripWellUser
3. Frontend → Hydrate full user data
4. Route → LocalUniversalRouter
```

## **Firebase User Object**
```javascript
{
  uid: "firebase-user-id",           // Firebase UID
  email: "user@example.com",         // User email
  displayName: "John Doe",           // Google display name
  photoURL: "https://...",           // Google profile photo
  emailVerified: true,               // Email verification status
}
```

## **Backend User Creation**
```javascript
// routes/TripWell/TripWellUserRoute.js
const user = new TripWellUser({
  firebaseId: user.uid,              // Firebase UID
  email: user.email,                 // User email
  firstName: null,                   // To be filled in ProfileSetup
  lastName: null,                    // To be filled in ProfileSetup
  hometownCity: null,                // To be filled in ProfileSetup
  role: "noroleset",                 // Default role
  tripId: null                       // No trip yet
});
```

## **Security**

### **Firebase Rules**
```javascript
// Firebase Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Backend Protection**
- All protected routes use `verifyFirebaseToken` middleware
- Firebase tokens are verified on every request
- User data is tied to Firebase UID

## **Error Handling**

### **Auth Errors**
```javascript
try {
  const result = await signInWithPopup(auth, googleProvider);
} catch (error) {
  if (error.code === 'auth/popup-closed-by-user') {
    // User closed popup
  } else if (error.code === 'auth/cancelled-popup-request') {
    // Multiple popups
  } else {
    // Other auth errors
  }
}
```

### **Token Expiration**
- Firebase tokens auto-refresh
- Axios interceptor handles token renewal
- Backend middleware validates tokens

## **Local Storage Pattern**
```javascript
// Frontend saves Firebase user data
localStorage.setItem("userData", JSON.stringify({
  firebaseId: "firebase-uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  hometownCity: "San Francisco"
}));
```

## **Key Benefits**
- ✅ **Firebase Authentication** - Firebase handles all Google OAuth complexity
- ✅ **Secure tokens** - Firebase manages token lifecycle
- ✅ **Auto-refresh** - Firebase tokens refresh automatically
- ✅ **Cross-platform** - Works on web, mobile, etc.
- ✅ **Simple integration** - Firebase does the heavy lifting

## **MVP 1 Flow**
1. **Home** → Firebase auth check
2. **Signup** → Google popup → Backend user creation → ProfileSetup
3. **ProfileSetup** → Complete profile → LocalUniversalRouter
4. **LocalUniversalRouter** → Route based on data existence

---

**Bottom Line**: Firebase handles auth, backend handles data, frontend handles routing. Clean separation of concerns!
