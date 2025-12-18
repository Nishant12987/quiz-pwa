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

// Firestore
const db = firebase.firestore();

// Analytics (DAU, sessions)
const analytics = firebase.analytics();

/* ================= ANALYTICS EVENTS ================= */

// Fired once per app open (DAU)
analytics.logEvent("app_open");

// Fired per session
analytics.logEvent("session_start");

/* ================= FIRESTORE → APP SYNC ================= */
async function syncUserFromFirestore() {
  const email = localStorage.getItem("user_email");
  if (!email) return;

  try {
    const doc = await db.collection("users").doc(email).get();
    if (!doc.exists) return;

    const cloud = doc.data();
    const access = JSON.parse(localStorage.getItem("user_access"));

    if (typeof cloud.paid === "boolean") {
      access.paid = cloud.paid;
    }

    if (typeof cloud.testsDone === "number") {
      access.testsDone = Math.max(access.testsDone, cloud.testsDone);
    }

    localStorage.setItem("user_access", JSON.stringify(access));
  } catch (e) {
    console.error("Firestore sync failed:", e);
  }
}

