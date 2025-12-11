// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCopUDRLwUo2viat3kfZTTb2tzqK-lGEpE",
    authDomain: "areared-42108.firebaseapp.com",
    projectId: "areared-42108",
    storageBucket: "areared-42108.firebasestorage.app",
    messagingSenderId: "710141728024",
    appId: "1:710141728024:web:e051f724c7594f3be67a6d",
    measurementId: "G-JWR4X8DSPN"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);