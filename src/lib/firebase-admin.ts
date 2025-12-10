import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    return;
  }

  const serviceAccountKeyString = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKeyString) {
    throw new Error('SERVICE_ACCOUNT_KEY_JSON is not set. The Admin SDK cannot be initialized. Please add it to your .env file and Firebase Functions config.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKeyString);

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
    if (error instanceof SyntaxError) {
      throw new Error(`Firebase Admin initialization error: Failed to parse SERVICE_ACCOUNT_KEY_JSON. Please ensure it is a valid, single-line JSON string. Original error: ${error.message}`);
    } else if (error.code === 'app/duplicate-app') {
      if (!admin.apps[0]) {
        throw new Error("Firebase Admin SDK reported a duplicate app, but no app was found. This is an unexpected state.");
      }
      adminDb = admin.firestore();
    } else {
      // Pass along the specific initialization error.
      throw new Error(`Firebase Admin initialization error: ${error.message}`);
    }
  }
}

try {
  initializeAdminApp();
} catch (error: any) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK. The application will not function correctly.", error);
  // In a real app, you might want to prevent the app from starting or have a safe fallback,
  // but for now, logging the critical error is essential.
  // We re-throw the error to ensure the problem is visible during server startup.
  throw error;
}


export { adminDb };