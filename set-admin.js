/*
 * Usage:
 * 1. Make sure you have firebase-admin installed (`npm i firebase-admin`)
 * 2. Download your service account key from Firebase Console > Project Settings > Service accounts
 *    and save it as `serviceAccountKey.json` in your project root.
 * 3. Replace 'PASTE_YOUR_USER_ID_HERE' with the actual UID of the user you want to make an admin.
 * 4. Run the script from your terminal: `node set-admin.js`
 */

const admin = require('firebase-admin');

// IMPORTANT: Path to your service account key file.
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        console.log('Firebase Admin SDK already initialized.');
    } else {
        console.error('Error initializing Firebase Admin SDK:', error);
        process.exit(1);
    }
}


// The UID of the user you want to make an admin.
// ----> REPLACE THIS WITH THE UID YOU COPIED FROM THE FIREBASE CONSOLE <----
const uid = 'PASTE_YOUR_USER_ID_HERE';

if (uid === 'PASTE_YOUR_USER_ID_HERE') {
    console.error('Error: Please replace "PASTE_YOUR_USER_ID_HERE" with the actual User UID in the set-admin.js file.');
    process.exit(1);
}

// Set the custom claim { admin: true } for the user.
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('That user can now access the /admin page after they sign out and sign back in.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });
