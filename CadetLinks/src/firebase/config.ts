import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

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
<<<<<<< Search
export const db = getDatabase(app);
=======
const analytics = getAnalytics(app);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app, "gs://cadetlinks.firebasestorage.app"); 

>>>>>>> main
