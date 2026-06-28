import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Vite env config variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth: any;
let isMockClient = false;

// Check if credentials are set
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here';

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log('✅ Firebase Client SDK initialized.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Client SDK. Swapped to Mock Auth.', error);
    isMockClient = true;
  }
} else {
  console.warn('⚠️ VITE_FIREBASE_API_KEY not configured. Swapping to MOCK AUTH CLIENT.');
  isMockClient = true;
}

// Mock User interface & state representation
class MockAuthClient {
  private currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Initial emission
    setTimeout(() => callback(this.currentUser), 100);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithEmail(email: string, password: string) {
    let mockUid = 'citizen-1';
    let mockName = 'Sarah Connor';
    let role = 'citizen';

    if (email.includes('officer')) {
      mockUid = 'officer-1';
      mockName = 'Officer K';
      role = 'officer';
    } else if (email.includes('admin')) {
      mockUid = 'admin-1';
      mockName = 'Super Admin';
      role = 'admin';
    }

    const user = {
      uid: mockUid,
      email,
      displayName: mockName,
      getIdToken: async () => `mock-token-${mockUid}`,
      role
    };

    this.currentUser = user;
    this.emit();
    return { user };
  }

  async signUpWithEmail(email: string, name: string) {
    const mockUid = `citizen-${Math.random().toString(36).substring(7)}`;
    const user = {
      uid: mockUid,
      email,
      displayName: name || 'Citizen Hero',
      getIdToken: async () => `mock-token-${mockUid}`,
      role: 'citizen'
    };
    this.currentUser = user;
    this.emit();
    return { user };
  }

  async signInWithGoogle() {
    return this.signInWithEmail('citizen@hero.com', 'password');
  }

  async logout() {
    this.currentUser = null;
    this.emit();
    return true;
  }

  private emit() {
    this.listeners.forEach(l => l(this.currentUser));
  }
}

if (isMockClient) {
  auth = new MockAuthClient();
}

export { auth, isMockClient };
export default app;
