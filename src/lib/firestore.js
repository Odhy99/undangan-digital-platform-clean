// ================= USER CRUD =================
// Koleksi: users, dokumen: auto-ID atau email
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addUser(data) {
  // data: { username, passwordHash, type, whatsapp, ... }
  const docRef = await addDoc(collection(db, 'users'), data);
  return { id: docRef.id, ...data };
}

export async function updateUser(id, data) {
  await updateDoc(doc(db, 'users', id), data);
  return { id, ...data };
}

export async function deleteUser(id) {
  return await deleteDoc(doc(db, 'users', id));
}

export async function getUserById(id) {
  const docSnap = await getDoc(doc(db, 'users', id));
  if (docSnap.exists()) return { id, ...docSnap.data() };
  return null;
}
// ================= PAYMENT INFO (ADMIN) =================
// Simpan seluruh info pembayaran (banks & ewallets) ke satu dokumen
export async function getPaymentInfo() {
  const docSnap = await getDoc(doc(db, 'admin_config', 'paymentInfo'));
  if (docSnap.exists()) return docSnap.data();
  return { banks: [], ewallets: [] };
}

export async function setPaymentInfo(data) {
  // data: { banks: [...], ewallets: [...] }
  try {
    await updateDoc(doc(db, 'admin_config', 'paymentInfo'), data);
  } catch (err) {
    // Jika dokumen belum ada, buat baru
    if (err.code === 'not-found' || err.message?.includes('No document to update')) {
      // Gunakan setDoc agar id dokumen tetap 'paymentInfo'
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'admin_config', 'paymentInfo'), data);
    } else {
      throw err;
    }
  }
}
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

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

export async function getAllMusic() {
  const snapshot = await getDocs(collection(db, 'music'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


// Tambah musik, return { id, ...data }
export async function addMusic(data) {
  const docRef = await addDoc(collection(db, 'music'), data);
  return { id: docRef.id, ...data };
}

export async function deleteMusic(id) {
  return await deleteDoc(doc(db, 'music', id));
}

// ================= TEMPLATE CRUD =================
import { onSnapshot } from "firebase/firestore";

export async function getAllTemplates() {
  const snapshot = await getDocs(collection(db, 'templates'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeTemplates(callback) {
  // callback: function(templatesArray)
  return onSnapshot(collection(db, 'templates'), (snapshot) => {
    const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(templates);
  });
}

export async function addTemplate(data) {
  const docRef = await addDoc(collection(db, 'templates'), data);
  return { id: docRef.id, ...data };
}

export async function updateTemplate(id, data) {
  await updateDoc(doc(db, 'templates', id), data);
  return { id, ...data };
}

export async function deleteTemplate(id) {
  return await deleteDoc(doc(db, 'templates', id));
}

export async function getTemplateById(id) {
  const docSnap = await getDoc(doc(db, 'templates', id));
  if (docSnap.exists()) return { id, ...docSnap.data() };
  return null;
}


// ================= ORDER CRUD =================

export async function getAllOrders() {
  const snapshot = await getDocs(collection(db, 'orders'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeOrders(callback) {
  // callback: function(ordersArray)
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
}

export async function addOrder(data) {
  // Jangan set field id manual, gunakan Firestore auto-ID
  const docRef = await addDoc(collection(db, 'orders'), data);
  return { id: docRef.id, ...data };
}

export async function updateOrder(id, data) {
  await updateDoc(doc(db, 'orders', id), data);
  return { id, ...data };
}

export async function deleteOrder(id) {
  // Pastikan id string dan trim whitespace
  const docId = typeof id === 'string' ? id.trim() : String(id);
  try {
    // Debug log id yang akan dihapus
    console.log('[FIRESTORE] deleteOrder id:', docId);
    const res = await deleteDoc(doc(db, 'orders', docId));
    console.log('[FIRESTORE] deleteOrder SUCCESS:', docId, res);
    return res;
  } catch (err) {
    // Log error detail dari Firestore
    console.error('[FIRESTORE] deleteOrder ERROR:', docId, err && err.message, err);
    throw err;
  }
}

export async function getOrderById(id) {
  const docSnap = await getDoc(doc(db, 'orders', id));
  if (docSnap.exists()) return { id, ...docSnap.data() };
  return null;
}
