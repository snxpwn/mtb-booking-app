
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | undefined;
let initializationError: Error | null = null;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    return;
  }

  const serviceAccountKeyString = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKeyString) {
    const errorMessage = 'CRITICAL ERROR: SERVICE_ACCOUNT_KEY_JSON environment variable is not set.';
    console.error(errorMessage);
    initializationError = new Error(errorMessage);
    return;
  }

  try {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
        const errorMessage = `CRITICAL ERROR: Failed to parse SERVICE_ACCOUNT_KEY_JSON. Please verify it is valid JSON. Original parse error: ${e.message}`;
        console.error(errorMessage);
        initializationError = new Error(errorMessage);
        return;
    }

    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    adminDb = admin.firestore();
  } catch (error: any) {
    const errorMessage = `Firebase Admin initialization error: ${error.message}`;
    console.error(errorMessage);
    initializationError = new Error(errorMessage);
    // If it's a duplicate app error, we can still try to get the instance
    if (error.code === 'app/duplicate-app') {
      adminDb = admin.firestore();
      initializationError = null; // Reset error if we successfully get the instance
    }
  }
}

// Attempt initialization on module load
initializeAdminApp();

// Safe accessor that throws a meaningful error if DB is not ready
export const getAdminDb = () => {
    if (initializationError) {
        throw new Error(`Server configuration error: Firebase Admin SDK failed to initialize. Reason: ${initializationError.message}`);
    }
    if (!adminDb) {
        // This is a fallback for cases where initialization didn't set the error but db is still not available.
        throw new Error('Server configuration error: The app cannot connect to the database. The SERVICE_ACCOUNT_KEY_JSON may be missing or invalid.');
    }
    return adminDb;
};

// Export direct access for backward compatibility, but it might be undefined
export { adminDb };
