// Import Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration (Use environment variables for security)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app, {
  cacheSizeBytes: 1048576, // 1MB Cache instead of deprecated persistence
});
const storage = getStorage(app);

// 🔹 Function to Add Loan Application to Firestore
const addLoanApplication = async (userId, loanData) => {
  try {
    const docRef = await addDoc(collection(db, "loanApplications"), {
      userId,
      ...loanData,
      createdAt: new Date(),
    });
    console.log("✅ Loan Application Submitted, ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error submitting loan application:", error.message);
    throw error;
  }
};

// ✅ Export Firebase services and helper functions
export { app, auth, db, storage, onAuthStateChanged, addLoanApplication };
