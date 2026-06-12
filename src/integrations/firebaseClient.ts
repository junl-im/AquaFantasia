import { initializeApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyDDXIaFpwPZPI_YKvZ8E0nxjTea1813Ij4',
  authDomain: 'fishing-game-71e8b.firebaseapp.com',
  projectId: 'fishing-game-71e8b',
  storageBucket: 'fishing-game-71e8b.firebasestorage.app',
  messagingSenderId: '576322657158',
  appId: '1:576322657158:web:024fd944576af07131ea07',
  measurementId: 'G-P6PRSGCK1L',
};

export async function createFirebaseClient() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  await setPersistence(auth, browserSessionPersistence);
  const db = getFirestore(app);
  return { app, auth, db };
}
