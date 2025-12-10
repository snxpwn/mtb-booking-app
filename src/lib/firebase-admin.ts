import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    return;
  }

  const serviceAccountKeyString = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKeyString) {
    // Return early instead of throwing, so the app doesn't crash on start.
    // We will throw when accessing adminDb if it's undefined.
    console.error('CRITICAL ERROR: SERVICE_ACCOUNT_KEY_JSON environment variable is not set.');
    return;
  }

  try {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
        console.error('CRITICAL ERROR: Failed to parse SERVICE_ACCOUNT_KEY_JSON. It might be malformed.');
        return;
    }

    // This is the crucial fix: Ensure newline characters in the private key are correctly interpreted.
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    adminDb = admin.firestore();
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      adminDb = admin.firestore();
    } else {
      console.error(`Firebase Admin initialization error: ${error.message}`);
    }
  }
}

// Attempt initialization
initializeAdminApp();

// Safe accessor that throws a meaningful error if DB is not ready
export const getAdminDb = () => {
    if (!adminDb) {
        throw new Error('Database connection failed. The server is missing the SERVICE_ACCOUNT_KEY_JSON configuration.');
    }
    return adminDb;
};

// Export direct access for backward compatibility, but it might be undefined
export { adminDb };
