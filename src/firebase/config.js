// Configuración de Firebase para sincronización en la nube gratuita (Spark Plan)
// Si no hay variables de entorno configuradas, la app funciona de forma autónoma con persistencia local
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-DEMO-KEY-SOUND-CONTROL",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sound-event-control.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sound-event-control",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sound-event-control.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Determinar si Firebase tiene credenciales reales configuradas por el usuario
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  !import.meta.env.VITE_FIREBASE_API_KEY.includes('DEMO')
);

let app = null;
let db = null;
let auth = null;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("🔥 Firebase conectado exitosamente a Firestore & Auth");
  } else {
    console.log("⚡ Operando en Modo Autónomo Local (Persistencia ultra-rápida y 100% gratuita)");
  }
} catch (error) {
  console.warn("Firebase no inicializado, usando almacenamiento local:", error.message);
}

export { app, db, auth };
