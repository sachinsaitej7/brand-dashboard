// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, connectStorageEmulator } from "firebase/storage";


import {
  getFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";

import {
  getAuth,
  connectAuthEmulator,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

import config from "./config";

function connectToEmulators({ app, auth, db, storage }) {
  if (process.env.NODE_ENV === "development") {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
  }
  return { app, auth, db, storage };
}

function enableOffline({ db, app, auth, storage }) {
  enableMultiTabIndexedDbPersistence(db);
  return { db, app, auth, storage };
}


// Initialize Firebase
export function initialize() {
  const app = initializeApp(config.firebase);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app, "gs://clock-poc-11334");

  (async () => {
    await setPersistence(auth, browserLocalPersistence);
  })();

  return {
    app,
    analytics,
    db,
    auth,
    storage,
  };
}

export function getFirebase() {
  const existingApp = getApps()?.at(0);
  if (existingApp) return initialize();
  const services = connectToEmulators(initialize());
  return enableOffline(services);
}
