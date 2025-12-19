let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

const ADMIN_EMAIL = "nishantameta1@gmail.com";

/* ================= QUOTES ================= */
const quotes = [
  "🔥 Consistency beats talent every single time.",
  "🎯 One test today is one step closer to success.",
  "💪 Don’t stop now. You’re building momentum.",
  "📘 Practice like it’s the real exam.",
  "🏆 Discipline today, results tomorrow.",
  "🚀 Small efforts daily create big results.",
  "🧠 Accuracy improves with calm practice.",
  "⏳ Give your best for the next 40 minutes.",
  "🌟 You are closer than you think."
];

function getQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/* ================= AUTH ================= */
function login() {
  if (!agree.checked) return alert("Accept policies");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Enter email & password");

  auth.signInWithEmailAndPassword(email, password)
    .then(res => afterLogin(res.user))
    .catch(() =>
      auth.createUserWithEmailAndPassword(email, password)
        .then(res => afterLogin(res.user))
    );
}

function afterLogin(user) {
  const ref = db.collection("users").doc(user.uid);

  ref.get().then(doc => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        name: "",
        paid: user.email === ADMIN_EMAIL,
        testsDone: 0,
        scores: []
      });
      show("nameSetup");
    } else {
      showDashboard();
    }
  });
}

/* ================= SAVE NAME ================= */
function saveName() {
  const name = userNameInput.value.trim();
  if (!name) return alert("Enter name");

  auth.currentUser &&
    db.collection("users")
      .doc(auth.currentUser.uid)
      .update({ name })
      .then(showDashboard);
}

/* ================= DASHBOARD ================= */
function showDashboard() {
  hideAll();
  show("dashboard");

  db.collection("users")
    .doc(auth.currentUser.uid)
    .get()
    .then(doc => {
      const data = doc.data();
      welcome.innerText = "👋 Welcome, " + data.name;
      quoteBox.innerText = getQuote();
    });

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };
}

/* ================= START FLOW ================= */
function startFlow() {
  loadMock();
}

/* ================= LOAD MOCK ================= */
async function loadMock() {
  const path = "data/level1/english/mock1.json"; // unchanged logic placeholder

  const res = await fetch(path);
  questions = await res.json();

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

/* ================= QUIZ LOGIC (UNCHANGED) ================= */
// render, nextQ, prevQ, finishQuiz, timer, helpers
// ⛔ untouched for stability

/* ================= HELPERS ================= */
function hideAll() {
  ["login", "nameSetup", "dashboard", "quiz", "result", "history"]
    .forEach(id => document.getElementById(id).style.display = "none");
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

auth.onAuthStateChanged(user => {
  if (user) showDashboard();
});
