let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

/* ================= MOTIVATIONAL QUOTES ================= */
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
  const now = Date.now();
  const saved = JSON.parse(localStorage.getItem("daily_quote") || "{}");
  if (!saved.time || now - saved.time > 4 * 60 * 60 * 1000) {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    localStorage.setItem("daily_quote", JSON.stringify({ text: q, time: now }));
    return q;
  }
  return saved.text;
}

/* ================= LOGIN ================= */
function login() {
  if (!agree.checked) return alert("Accept policies");

  const email = emailInput();
  localStorage.setItem("user_email", email);

  if (!localStorage.getItem("user_access")) {
    localStorage.setItem("user_access", JSON.stringify({
      level: "",
      stream: "",
      language: "",
      paid: false,
      testsDone: 0,
      scores: []
    }));
  }

  hideAll();
  !localStorage.getItem("user_name") ? show("nameSetup") : showDashboard();
}

function emailInput() {
  const e = document.getElementById("email").value.trim();
  if (!e) throw alert("Enter email");
  return e;
}

/* ================= SAVE NAME ================= */
function saveName() {
  const name = document.getElementById("userNameInput").value.trim();
  if (!name) return alert("Enter name");
  localStorage.setItem("user_name", name);
  showDashboard();
}

/* ================= DASHBOARD ================= */
async function showDashboard() {
  hideAll();
  show("dashboard");
  await syncUserFromFirestore();

  const access = JSON.parse(localStorage.getItem("user_access"));
  welcome.innerText = "👋 Welcome, " + localStorage.getItem("user_name");
  quoteBox.innerText = getQuote();
  selectionBox.style.display = access.level ? "none" : "block";

  level.onchange = () => stream.style.display = level.value === "level2" ? "block" : "none";
}

/* ================= PAYMENT ================= */
function showPaymentPrompt(access) {
  const msg = access.language === "hindi"
    ? "🔒 आपका फ्री मॉक टेस्ट पूरा हो चुका है।\n\n₹149 में 20 मॉक टेस्ट अनलॉक करें।\n\nभुगतान के बाद स्क्रीनशॉट prepone.exam@gmail.com पर भेजें।\n2 घंटे में एक्सेस मिलेगा।"
    : "🔒 Your free mock test is completed.\n\nUnlock 20 tests for ₹149.\n\nEmail payment screenshot to prepone.exam@gmail.com.\nAccess within 2 hours.";

  if (confirm(msg)) {
    window.open("https://rzp.io/rzp/RVonbpx", "_blank");
  }
}

/* ================= START FLOW ================= */
function startFlow() {
  const access = JSON.parse(localStorage.getItem("user_access"));

  if (!access.level) {
    if (!level.value || !language.value) return alert("Select all options");
    if (level.value === "level2" && !stream.value) return alert("Select stream");

    access.level = level.value;
    access.stream = level.value === "level2" ? stream.value : "";
    access.language = language.value;
    localStorage.setItem("user_access", JSON.stringify(access));
  }

  if (!access.paid && access.testsDone >= 1) {
    showPaymentPrompt(access);
    return;
  }

  loadMock();
}

/* ================= LOAD MOCK ================= */
async function loadMock() {
  const access = JSON.parse(localStorage.getItem("user_access"));
  const mockNo = access.testsDone + 1;

  const folder = access.level === "level1"
    ? "level1"
    : access.stream === "social"
      ? "level2-social"
      : "level2-socio";

  const path = `data/${folder}/${access.language}/mock${mockNo}.json`;

  try {
    const res = await fetch(path);
    questions = await res.json();
  } catch {
    alert("No more mocks available");
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

/* ================= RENDER ================= */
function render() {
  qCounter.innerText = `Q ${index + 1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    if (answers[index] === i) btn.classList.add("selected");
    btn.onclick = () => { answers[index] = i; render(); };
    options.appendChild(btn);
  });
}

function nextQ() { if (index < questions.length - 1) index++; render(); }
function prevQ() { if (index > 0) index--; render(); }

/* ================= FINISH ================= */
function finishQuiz() {
  clearInterval(timer);
  let correct = 0, wrong = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  const score = (correct - wrong / 3).toFixed(2);
  const access = JSON.parse(localStorage.getItem("user_access"));
  access.testsDone++;
  access.scores.push(score);
  localStorage.setItem("user_access", JSON.stringify(access));

  hideAll();
  show("result");
  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText = score >= 30 ? "🏆 Excellent!" : score >= 20 ? "👍 Good effort!" : "💪 Keep practicing!";
}

/* ================= HISTORY ================= */
function showHistory() {
  const access = JSON.parse(localStorage.getItem("user_access"));
  if (!access.paid) return showPaymentPrompt(access);

  hideAll();
  show("history");
  historyTable.innerHTML = "<tr><th>Test</th><th>Score</th></tr>" +
    access.scores.map((s, i) => `<tr><td>Mock ${i + 1}</td><td>${s}</td></tr>`).join("");
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
  time.innerText = Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, "0");
}

/* ================= HELPERS ================= */
function hideAll() {
  ["login", "nameSetup", "dashboard", "quiz", "result", "history"]
    .forEach(id => document.getElementById(id).style.display = "none");
}

function show(id) { document.getElementById(id).style.display = "block"; }

/* ================= AUTO LOGIN ================= */
if (localStorage.getItem("user_email")) {
  hideAll();
  localStorage.getItem("user_name") ? showDashboard() : show("nameSetup");
}
