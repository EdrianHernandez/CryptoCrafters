// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    limit,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmzo15i1Yv0AL5YOuSstDkT1T3NghSzuc",
  authDomain: "cryptocrafters-93c85.firebaseapp.com",
  projectId: "cryptocrafters-93c85",
  storageBucket: "cryptocrafters-93c85.firebasestorage.app",
  messagingSenderId: "565112428853",
  appId: "1:565112428853:web:374ca42dce50ae9eab547c",
  measurementId: "G-8K5YPV4KLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export services for use in other scripts
export { 
    app, 
    analytics, 
    auth, 
    db, 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    limit,
    setDoc,
    serverTimestamp,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    onAuthStateChanged,
    signOut 
};
