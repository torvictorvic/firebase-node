const admin = require('firebase-admin');

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_DB_URL
} = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: (FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  }),
  databaseURL: FIREBASE_DB_URL
});

const db = admin.database();
module.exports = { admin, db };
