// js/firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyD04D7s8Y4ZCUxWE08cYetErY0SXA2hcb0",
  authDomain: "prepone-92297.firebaseapp.com",
  projectId: "prepone-92297",
  storageBucket: "prepone-92297.firebasestorage.app",
  messagingSenderId: "208806915220",
  appId: "1:208806915220:web:a54fbca8db1dc88c2e1881",
  measurementId: "G-TRTM2VX9E5"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
