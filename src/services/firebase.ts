/// <reference types="vite/client" />

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpXRJrE4aS2-wQKcn0WnegC22s02aWYrQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "straight-modem-gw1xt.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "straight-modem-gw1xt",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "straight-modem-gw1xt.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87895877897",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:87895877897:web:f1514539ea370e27360bd8"
};

const app = initializeApp(firebaseConfig);

// Use the custom database ID provisioned for this AI Studio applet or env variable override

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

