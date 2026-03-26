// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyBswld1nz8X-xXRYs_Q8wr5ihI0A0xvWWI",
  authDomain: "cadetlinks.firebaseapp.com",
  databaseURL: "https://cadetlinks-default-rtdb.firebaseio.com",
  projectId: "cadetlinks",
  storageBucket: "cadetlinks.firebasestorage.app",
  messagingSenderId: "111800465306",
  appId: "1:111800465306:web:0198344279e2876b952c23",
  measurementId: "G-8FC6FRBYKP",
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);


