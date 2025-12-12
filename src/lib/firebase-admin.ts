
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;
let isFirebaseAdminInitialized = false;

function initializeAdminApp() {
  console.log("[Firebase Admin Debug] initializeAdminApp called.");

  // Prevent re-initialization
  if (isFirebaseAdminInitialized) {
    console.log("[Firebase Admin Debug] Admin SDK already initialized. Skipping.");
    // Ensure adminDb is still available
    if (!adminDb) {
      adminDb = admin.firestore();
    }
    return;
  }

  const serviceAccountKeyString = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKeyString) {
    console.error('CRITICAL ERROR: SERVICE_ACCOUNT_KEY_JSON environment variable is not set.');
    // Do not proceed with initialization
    return;
  }

  try {
    let serviceAccount;
    // Attempt to parse the service account key
    try {
        serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
        console.error('CRITICAL ERROR: Failed to parse SERVICE_ACCOUNT_KEY_JSON. It is likely malformed. Error:', e.message);
        // Stop execution if parsing fails
        return;
    }
    
    // Replace literal \\n with actual newlines in the private key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    } else {
       console.error('CRITICAL ERROR: The parsed service account key is missing the "private_key" field.');
       return;
    }

    // Initialize the app if it hasn't been already
    if (admin.apps.length === 0) {
        console.log("[Firebase Admin Debug] No existing Firebase apps. Initializing a new one.");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        isFirebaseAdminInitialized = true;
        console.log("Firebase Admin SDK initialized successfully.");
    } else {
        console.log("[Firebase Admin Debug] An app already exists. Reusing existing app.");
        isFirebaseAdminInitialized = true; // Mark as initialized
    }
    
    adminDb = admin.firestore();

  } catch (error: any) {
    console.error(`Firebase Admin initialization error: ${error.message}`);
    // Clear the flag on failure to allow retry if applicable, though it's unlikely to succeed without a config change
    isFirebaseAdminInitialized = false;
  }
}

// Ensure initialization is attempted at least once.
initializeAdminApp();

// Safe accessor that attempts initialization if not already done.
export const getAdminDb = (): admin.firestore.Firestore => {
    if (!isFirebaseAdminInitialized || !adminDb) {
        console.warn("[Firebase Admin Debug] DB not initialized. Attempting re-initialization inside getAdminDb.");
        initializeAdminApp();
    }

    if (!adminDb) {
        // This is a critical failure state.
        throw new Error('Database connection failed. The server is missing the SERVICE_ACCOUNT_KEY_JSON configuration or Firebase Admin SDK failed to initialize.');
    }
    return adminDb;
};
