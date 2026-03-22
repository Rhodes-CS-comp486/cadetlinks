import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBswld1nz8X-xXRYs_Q8wr5ihI0A0xvWWI",
  authDomain: "cadetlinks.firebaseapp.com",
  databaseURL: "https://cadetlinks-default-rtdb.firebaseio.com",
  projectId: "cadetlinks",
  storageBucket: "cadetlinks.firebasestorage.app",
  messagingSenderId: "111800465306",
  appId: "1:111800465306:web:0198344279e2876b952c23",
  measurementId: "G-8FC6FRBYKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);