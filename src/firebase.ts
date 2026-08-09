import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5-UqkA9bmy6SgdPLYjp1Nbhi-VRp2YGw",
  authDomain: "pineapple-5aa58.firebaseapp.com",
  projectId: "pineapple-5aa58",
  storageBucket: "pineapple-5aa58.firebasestorage.app",
  messagingSenderId: "352172670093",
  appId: "1:352172670093:web:73e6f11ff3c446bafc76c4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db };