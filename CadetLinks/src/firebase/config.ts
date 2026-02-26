import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cadetlinks-default-rtdb.firebaseapp.com",
  databaseURL: "https://cadetlinks-default-rtdb.firebaseio.com/",
  projectId: "cadetlinks-default-rtdb",
  storageBucket: "cadetlinks-default-rtdb.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);