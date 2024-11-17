// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase setup with the project's unique credentials to enable authentication and database services
const firebaseConfig = {
  apiKey: "AIzaSyCmzo15i1Yv0AL5YOuSstDkT1T3NghSzuc",
  authDomain: "cryptocrafters-93c85.firebaseapp.com",
  projectId: "cryptocrafters-93c85",
  storageBucket: "cryptocrafters-93c85.firebasestorage.app",
  messagingSenderId: "565112428853",
  appId: "1:565112428853:web:374ca42dce50ae9eab547c",
  measurementId: "G-8K5YPV4KLH"
};

// Initialize Firebase with the project configuration and set up services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services to be used elsewhere in the application for user authentication and data storage
export { app, analytics, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, addDoc, collection };