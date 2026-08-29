// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "realestatemern-8057f.firebaseapp.com",
  projectId: "realestatemern-8057f",
  storageBucket: "realestatemern-8057f.firebasestorage.app",
  messagingSenderId: "300042129203",
  appId: "1:300042129203:web:ae55b2012c8e58bb4db846"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);