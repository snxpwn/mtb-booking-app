
'use server';

import admin from 'firebase-admin';

// This is a global cache for the initialized Firebase Admin app and Firestore instance.
// Using a global variable ensures that we only initialize the SDK once, which is crucial
// in a serverless environment where modules can be re-evaluated.
let globalWithFirebase = global as typeof globalThis & {
  _firebaseAdminApp: admin.app.App | undefined;
  _firestore: admin.firestore.Firestore | undefined;
};

function initializeFirebaseAdmin() {
  console.log('[Firebase Admin] Attempting to initialize...');

  // If the app is already initialized, reuse the existing instance.
  if (globalWithFirebase._firebaseAdminApp) {
    console.log('[Firebase Admin] Reusing existing initialized instance.');
    return {
      app: globalWithFirebase._firebaseAdminApp,
      db: globalWithFirebase._firestore!,
    };
  }

  const serviceAccountKeyString = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKeyString) {
    console.error('[Firebase Admin] CRITICAL: SERVICE_ACCOUNT_KEY_JSON is not set. Database operations will fail.');
    throw new Error('Server is missing critical configuration for database access.');
  }

  try {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
      // The key often comes as a stringified JSON within a string.
      if (typeof serviceAccount === 'string') {
        serviceAccount = JSON.parse(serviceAccount);
      }
    } catch (e: any) {
      console.error('[Firebase Admin] CRITICAL: Failed to parse SERVICE_ACCOUNT_KEY_JSON. It is likely malformed.', e.message);
      throw new Error('Server configuration for database access is malformed.');
    }

    // The private key needs actual newlines, not the literal '\n' string.
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    } else {
      console.error('[Firebase Admin] CRITICAL: Parsed service account key is missing the "private_key" field.');
      throw new Error('Server configuration for database access is invalid.');
    }
    
    console.log('[Firebase Admin] Initializing a new Firebase Admin app instance.');
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const db = admin.firestore();

    // Cache the initialized instances in the global object.
    globalWithFirebase._firebaseAdminApp = app;
    globalWithFirebase._firestore = db;
    
    console.log('[Firebase Admin] Initialization successful.');
    return { app, db };

  } catch (error: any) {
    console.error('[Firebase Admin] CRITICAL: Firebase Admin SDK initialization failed.', error.message);
    // Do not cache on failure.
    globalWithFirebase._firebaseAdminApp = undefined;
    globalWithFirebase._firestore = undefined;
    throw new Error(`Server-side Firebase initialization failed: ${error.message}`);
  }
}

/**
 * Gets the initialized Firestore database instance.
 * This function ensures that the Firebase Admin SDK is initialized on-demand and only once.
 */
export const getAdminDb = (): admin.firestore.Firestore => {
  const { db } = initializeFirebaseAdmin();
  return db;
};
