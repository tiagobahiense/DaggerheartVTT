import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Helper para ler variáveis sem o TypeScript reclamar
const getEnv = (key: string) => {
  
  return import.meta.env[key];
};

const firebaseConfig = {
  apiKey: getEnv("VITE_API_KEY"),
  authDomain: getEnv("VITE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_PROJECT_ID"),
  storageBucket: getEnv("VITE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_APP_ID"),
  measurementId: getEnv("VITE_MEASUREMENT_ID")
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (window.location.hostname === "localhost") {
  
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export { auth, db, storage };