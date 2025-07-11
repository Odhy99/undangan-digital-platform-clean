import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCng39jE_0N5Spco2ADef3xmijpZgyhxCI",
  authDomain: "undangan-digital-38d0b.firebaseapp.com",
  projectId: "undangan-digital-38d0b",
  storageBucket: "undangan-digital-38d0b.firebasestorage.app",
  messagingSenderId: "389804485470",
  appId: "1:389804485470:web:a3f39722d76ca149b8fdcf",
  measurementId: "G-7WCGDGHR0T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SETTINGS_DOC = doc(db, "admin_config", "siteSettings");

export async function getSiteSettings() {
  const snap = await getDoc(SETTINGS_DOC);
  return snap.exists() ? snap.data() : null;
}

export async function setSiteSettings(data) {
  await setDoc(SETTINGS_DOC, data, { merge: true });
}
