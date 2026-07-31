import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firestoreDb: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('firebase-applet-config.json missing, using local DB storage sync');
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = getApps().length === 0 ? initializeApp(config) : getApp();

    firestoreDb = config.firestoreDatabaseId 
      ? getFirestore(app, config.firestoreDatabaseId) 
      : getFirestore(app);

    console.log('Firebase Firestore Web SDK initialized successfully with databaseId:', config.firestoreDatabaseId || 'default');
    return firestoreDb;
  } catch (err) {
    console.warn('Firebase Firestore init warning, using local DB storage sync:', err);
    return null;
  }
}

