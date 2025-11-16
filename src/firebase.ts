import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

type FirebaseRuntimeConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

function loadFirebaseConfig(): FirebaseRuntimeConfig {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
  } satisfies FirebaseRuntimeConfig;

  const missing = Object.entries(cfg)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    console.error(
      `⚠️ Firebase ENV variáveis faltando: ${missing.join(', ')}.\n` +
        'Verifique seu arquivo .env.* e reinicie o servidor de desenvolvimento.',
    );
    throw new Error('Firebase configuração incompleta — confira variáveis de ambiente.');
  }

  return cfg;
}

const firebaseConfig = loadFirebaseConfig();
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const appId = firebaseConfig.projectId;

export { appId, auth, db, firebaseApp as app, firebaseConfig, storage };
export type { FirebaseRuntimeConfig };
export default firebaseApp;
