// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PASTE YOUR CONFIG OBJECT FROM STEP 2 HERE
  apiKey: "AIzaSyB9gZWxWz-JTz_j-zJF1-_BJyR2McvQodw",
  authDomain: "footy-dle.firebaseapp.com",
  projectId: "footy-dle",
  storageBucket: "footy-dle.firebasestorage.app",
  messagingSenderId: "830682628570",
  appId: "1:830682628570:web:036ab532a219f2c559c0e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
export const db = getFirestore(app);