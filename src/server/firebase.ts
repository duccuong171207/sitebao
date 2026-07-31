import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let firestoreDb: ReturnType<typeof getFirestore> | null = null;

export function getFirestoreDb() {
  if (firestoreDb) return firestoreDb;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    let projectId = 'fifth-fusion-1zp2g';
    let databaseId = undefined;

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.projectId) projectId = config.projectId;
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
    }

    if (getApps().length === 0) {
      initializeApp({ projectId });
    }

    // Initialize Firestore with specific database ID if available
    firestoreDb = databaseId ? getFirestore(databaseId) : getFirestore();
    console.log('Firebase Firestore initialized successfully with databaseId:', databaseId || 'default');
    return firestoreDb;
  } catch (err) {
    console.warn('Firebase Firestore init warning, using local DB storage sync:', err);
    return null;
  }
}
