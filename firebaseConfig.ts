// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwTYibUSqOzhEcic5hFHZZCCDNI37GDZs",
  authDomain: "acadlyapp.firebaseapp.com",
  projectId: "acadlyapp",
  storageBucket: "acadlyapp.firebasestorage.app",
  messagingSenderId: "861903289191",
  appId: "1:861903289191:web:31fd12aa1017cf37048dc2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
