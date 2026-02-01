import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Helper para evitar erros de tipagem com import.meta
const getEnv = (key: string) => {

  return import.meta.env[key];
};

const firebaseConfig = {
  apiKey: getEnv("VITE_API_KEY"),
  authDomain: getEnv("VITE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_PROJECT_ID"),
  messagingSenderId: getEnv("VITE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_APP_ID"),
  measurementId: getEnv("VITE_MEASUREMENT_ID")
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Conecta aos emuladores se estiver rodando localmente (localhost)
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { auth, db };