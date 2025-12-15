
'use server';

import admin from 'firebase-admin';

// A global cache for the Firestore instance to avoid re-initializing on every call.
let db: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  console.log('[Firebase Admin] Attempting to initialize...');

  // Check if the app is already initialized. The Firebase Admin SDK is a singleton,
  // and initializing it more than once will throw an error.
  if (admin.apps.length > 0) {
    console.log('[Firebase Admin] Reusing existing initialized instance.');
    db = admin.firestore();
    return;
  }

  try {
    console.log('[Firebase Admin] Initializing a new Firebase Admin app instance...');
    
    // When deployed in a Google Cloud environment (like App Hosting/Cloud Run),
    // the SDK automatically detects the environment's service account credentials.
    // There is no need to manually provide a service account key.
    admin.initializeApp();
    
    db = admin.firestore();
    console.log('[Firebase Admin] Initialization successful.');

  } catch (error: any) {
    console.error('[Firebase Admin] CRITICAL: Firebase Admin SDK initialization failed.', error.message);
    // This is a fatal error; the application cannot function without database access.
    throw new Error(`Server-side Firebase initialization failed: ${error.message}`);
  }
}

/**
 * Gets the initialized Firestore database instance.
 * This function ensures that the Firebase Admin SDK is initialized on-demand and only once.
 */
export const getAdminDb = (): admin.firestore.Firestore => {
  // If the 'db' instance isn't cached, initialize it.
  if (!db) {
    initializeFirebaseAdmin();
  }
  return db;
};
