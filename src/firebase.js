import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function loadFirebaseConfig() {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const missing = Object.entries(cfg)
    .filter(([_, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error(
      `⚠️ Firebase ENV variáveis faltando: ${missing.join(", ")}.\n` +
        'Verifique seu arquivo .env.* e reinicie o servidor de desenvolvimento.'
    );
    throw new Error('Firebase configuração incompleta — confira variáveis de ambiente.');
  }

  return cfg;
}

const firebaseConfig = loadFirebaseConfig();
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = firebaseConfig.projectId;

export { app, auth, db, storage, appId, firebaseConfig };
export default app;
