// 🔥 Firebase configuration (PrepOne)
const firebaseConfig = {
  apiKey: "AIzaSyD04D7s8Y4ZCUxWE08cYetErY0SXA2hcb0",
  authDomain: "prepone-92297.firebaseapp.com",
  projectId: "prepone-92297",
  storageBucket: "prepone-92297.firebasestorage.app",
  messagingSenderId: "208806915220",
  appId: "1:208806915220:web:a54fbca8db1dc88c2e1881",
  measurementId: "G-TRTM2VX9E5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore database reference
const db = firebase.firestore();

/* ================= FIRESTORE → APP SYNC ================= */
async function syncUserFromFirestore() {
  const email = localStorage.getItem("user_email");
  if (!email) return;

  try {
    const doc = await db.collection("users").doc(email).get();
    if (!doc.exists) return;

    const cloud = doc.data();
    const access = JSON.parse(localStorage.getItem("user_access"));

    // 🔐 Paid status comes from Firestore
    if (typeof cloud.paid === "boolean") {
      access.paid = cloud.paid;
    }

    // ✅ Never reduce testsDone
    if (typeof cloud.testsDone === "number") {
      access.testsDone = Math.max(access.testsDone, cloud.testsDone);
    }

    localStorage.setItem("user_access", JSON.stringify(access));
  } catch (error) {
    console.error("❌ Firestore sync failed:", error);
  }
}
