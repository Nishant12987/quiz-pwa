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

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return alert("Enter email & password");

  auth.signInWithEmailAndPassword(email, password)
    .then(res => afterLogin(res.user))
    .catch(err => {
      // 👇 proper error handling
      if (err.code === "auth/wrong-password")
        alert("Wrong password");
      else if (err.code === "auth/user-not-found")
        auth.createUserWithEmailAndPassword(email, password)
          .then(res => afterLogin(res.user))
          .catch(e => alert(e.message));
      else
        alert(err.message);
    });
}

/* ================= RESET PASSWORD ================= */
function resetPassword() {
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter your email first");

  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent"))
    .catch(err => alert(err.message));
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
      hideAll();
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
  const path = "data/level1/english/mock1.json";

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    questions = await res.json();
  } catch {
    alert("Mock file not found");
    showDashboard();
    return;
  }

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

/* ================= QUIZ RENDER ================= */
function render() {
  qCounter.innerText = `Q ${index + 1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    if (answers[index] === i) btn.classList.add("selected");
    btn.onclick = () => {
      answers[index] = i;
      render();
    };
    options.appendChild(btn);
  });
}

function nextQ() {
  if (index < questions.length - 1) {
    index++;
    render();
  }
}

function prevQ() {
  if (index > 0) {
    index--;
    render();
  }
}

/* ================= TIMER ================= */
function startTimer() {
  updateTime();
  timer = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function updateTime() {
  time.innerText =
    Math.floor(timeLeft / 60) +
    ":" +
    String(timeLeft % 60).padStart(2, "0");
}

/* ================= FINISH ================= */
function finishQuiz() {
  clearInterval(timer);

  let correct = 0, wrong = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  const score = (correct - wrong / 3).toFixed(2);

  hideAll();
  show("result");

  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText =
    score >= 30
      ? "🏆 Excellent! You are exam ready."
      : score >= 20
      ? "👍 Good effort! Keep practicing."
      : "💪 Don’t give up! Improvement will come.";
}

/* ================= HELPERS ================= */
function hideAll() {
  ["login", "nameSetup", "dashboard", "quiz", "result", "history"]
    .forEach(id => document.getElementById(id).style.display = "none");
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

/* ================= AUTO LOGIN (SAFE) ================= */
auth.onAuthStateChanged(user => {
  if (!user) return;

  const ref = db.collection("users").doc(user.uid);
  ref.get().then(doc => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        name: "User",
        paid: user.email === ADMIN_EMAIL,
        testsDone: 0,
        scores: []
      });
    }
    showDashboard();
  });
});
