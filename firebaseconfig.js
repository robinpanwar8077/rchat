import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeHxAqLTME63Kp6fa2cSKHO_SuDdJ7sa8",
  authDomain: "hoodchat-5a8dd.firebaseapp.com",
  projectId: "hoodchat-5a8dd",
  storageBucket: "hoodchat-5a8dd.appspot.com",
  messagingSenderId: "661211220707",
  appId: "1:661211220707:web:981eb46ff1767ed6d613d6",
  measurementId: "G-1TCEXZDLHP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserSessionPersistence);

export { app, auth, db, storage };
