import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db: any;
let auth: any;
let storage: any;
let isMock = false;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check if credentials are present
if (projectId && clientEmail && privateKey) {
  try {
    // Format private key correctly if it has escaped newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      storageBucket: `${projectId}.appspot.com`
    });

    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK. Switching to local mock mode.', error);
    isMock = true;
  }
} else {
  console.warn('⚠️ Firebase credentials missing. Bootstrapping application in LOCAL MOCK DEMO MODE.');
  isMock = true;
}

// In-Memory Database Fallback for smooth local development/reviewing
class MockFirestore {
  private store: { [collection: string]: { [id: string]: any } } = {
    users: {},
    issues: {},
    comments: {},
    predictions: {}
  };

  collection(name: string) {
    if (!this.store[name]) {
      this.store[name] = {};
    }
    const colStore = this.store[name];

    return {
      doc: (id?: string) => {
        const docId = id || Math.random().toString(36).substring(2, 15);
        return {
          id: docId,
          get: async () => ({
            exists: !!colStore[docId],
            data: () => colStore[docId] || null,
            id: docId
          }),
          set: async (data: any, options?: any) => {
            const existing = colStore[docId] || {};
            if (options?.merge) {
              colStore[docId] = { ...existing, ...data };
            } else {
              colStore[docId] = data;
            }
            return { id: docId };
          },
          update: async (data: any) => {
            if (!colStore[docId]) throw new Error(`Document ${docId} does not exist`);
            colStore[docId] = { ...colStore[docId], ...data };
            return { id: docId };
          },
          delete: async () => {
            delete colStore[docId];
            return true;
          }
        };
      },
      get: async () => {
        const docs = Object.entries(colStore).map(([id, data]) => ({
          id,
          exists: true,
          data: () => data
        }));
        return {
          docs,
          forEach: (callback: (doc: any) => void) => docs.forEach(callback),
          empty: docs.length === 0
        };
      },
      where: function(field: string, op: string, value: any) {
        // Return structured sub-interface to chain queries or fetch filtered docs
        return {
          get: async () => {
            const filtered = Object.entries(colStore)
              .filter(([_, data]) => {
                const val = data[field];
                if (op === '==') return val === value;
                if (op === 'array-contains') return Array.isArray(val) && val.includes(value);
                if (op === '>=') return val >= value;
                if (op === '<=') return val <= value;
                return true;
              })
              .map(([id, data]) => ({
                id,
                exists: true,
                data: () => data
              }));
            return {
              docs: filtered,
              forEach: (callback: (doc: any) => void) => filtered.forEach(callback),
              empty: filtered.length === 0
            };
          },
          limit: function() { return this; },
          orderBy: function() { return this; }
        };
      },
      limit: function() { return this; },
      orderBy: function() { return this; }
    };
  }

  // Helper to pre-populate mock data
  __populate(collectionName: string, data: any) {
    if (!this.store[collectionName]) this.store[collectionName] = {};
    this.store[collectionName][data.id || data.uid] = data;
  }
}

class MockAuth {
  private users: { [uid: string]: any } = {};

  async verifyIdToken(token: string) {
    // Standard mock authentication token parser for testing
    if (token.startsWith('mock-token-')) {
      const uid = token.replace('mock-token-', '');
      const user = this.users[uid] || { uid, email: `${uid}@communityhero.org`, role: 'citizen', name: 'Demo User' };
      return {
        uid: user.uid,
        email: user.email,
        role: user.role || 'citizen',
        name: user.name || 'Demo User'
      };
    }
    throw new Error('Invalid mock authentication token format');
  }

  async getUser(uid: string) {
    if (this.users[uid]) return this.users[uid];
    return {
      uid,
      email: `${uid}@communityhero.org`,
      displayName: 'Demo User',
      customClaims: { role: 'citizen' }
    };
  }

  async setCustomUserClaims(uid: string, claims: any) {
    if (!this.users[uid]) {
      this.users[uid] = { uid, customClaims: {} };
    }
    this.users[uid].customClaims = claims;
  }

  __registerMockUser(user: any) {
    this.users[user.uid] = user;
  }
}

class MockStorage {
  bucket() {
    return {
      file: (filename: string) => {
        return {
          save: async (buffer: Buffer, options?: any) => {
            console.log(`[Mock Storage] File ${filename} saved to mock bucket.`);
            return true;
          },
          getSignedUrl: async (config: any) => {
            // Return a local-friendly data url representation or placeholder URL
            return [`/mock-assets/${filename}`];
          }
        };
      }
    };
  }
}

if (isMock) {
  db = new MockFirestore();
  auth = new MockAuth();
  storage = new MockStorage();

  // Populate basic mock profiles to enable local verification
  (auth as MockAuth).__registerMockUser({ uid: 'citizen-1', email: 'citizen@hero.com', role: 'citizen', name: 'Sarah Connor' });
  (auth as MockAuth).__registerMockUser({ uid: 'officer-1', email: 'officer@gov.in', role: 'officer', name: 'Officer K', department: 'Roads' });
  (auth as MockAuth).__registerMockUser({ uid: 'admin-1', email: 'admin@hero.com', role: 'admin', name: 'Super Admin' });

  // Populate DB with corresponding user records
  const now = new Date();
  (db as MockFirestore).__populate('users', {
    uid: 'citizen-1',
    name: 'Sarah Connor',
    email: 'citizen@hero.com',
    role: 'citizen',
    reputationScore: 120,
    xp: 450,
    level: 3,
    badges: ['first_report', 'helpful_citizen'],
    completedMissions: [],
    createdAt: now,
    updatedAt: now
  });
  (db as MockFirestore).__populate('users', {
    uid: 'officer-1',
    name: 'Officer K',
    email: 'officer@gov.in',
    role: 'officer',
    department: 'Roads',
    reputationScore: 100,
    xp: 1200,
    level: 7,
    badges: ['quick_responder', 'top_officer'],
    completedMissions: [],
    createdAt: now,
    updatedAt: now
  });
  (db as MockFirestore).__populate('users', {
    uid: 'admin-1',
    name: 'Super Admin',
    email: 'admin@hero.com',
    role: 'admin',
    reputationScore: 200,
    xp: 5000,
    level: 15,
    badges: ['keymaker'],
    completedMissions: [],
    createdAt: now,
    updatedAt: now
  });
}

export { db, auth, storage, isMock };
export const FieldValue = admin.firestore?.FieldValue || {
  arrayUnion: (...elements: any[]) => elements,
  arrayRemove: (...elements: any[]) => [],
  serverTimestamp: () => new Date()
};
