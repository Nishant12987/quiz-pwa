let questions = [], answers = [], index = 0;
let timeLeft = 2400, timer;
let currentMock = 1;

/* ---------- ANALYTICS INIT ---------- */
if (!localStorage.getItem("analytics")) {
  localStorage.setItem("analytics", JSON.stringify({
    installs: 1,
    totalAttempts: 0
  }));
}

/* ---------- LOGIN ---------- */
function login() {
  if (!agree.checked) return alert("Please accept policies");
  const email = emailInput();
  if (!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if (!localStorage.getItem("usage")) {
    localStorage.setItem("usage", JSON.stringify({
      tests: 0,
      paid: false,
      mockIndex: 1,
      history: []
    }));
  }
  showDashboard();
}

/* ---------- DASHBOARD ---------- */
function showDashboard() {
  hideAll();
  show("dashboard");

  welcome.innerText = "Welcome " + localStorage.getItem("user");
  level.onchange = () => stream.style.display = level.value === "level2" ? "block" : "none";

  const u = JSON.parse(localStorage.getItem("usage"));
  limit.innerText = u.paid
    ? "Unlimited access unlocked"
    : "1 free mock available";
}

/* ---------- FLOW ---------- */
function startFlow() {
  const u = JSON.parse(localStorage.getItem("usage"));
  const isTestMode = document.getElementById("testMode").checked;

  if (!level.value || !language.value) return alert("Select all options");
  if (level.value === "level2" && !stream.value) return alert("Select stream");

  if (!isTestMode && !u.paid && u.tests >= 1) {
    alert("Free test over. Pay ₹149 to unlock all mocks.");
    window.open("https://razorpay.me/@prepone", "_blank");
    return;
  }

  loadTest();
}

/* ---------- LOAD REAL MOCK ---------- */
async function loadTest() {
  const u = JSON.parse(localStorage.getItem("usage"));
  currentMock = u.mockIndex;

  const base =
    level.value === "level1"
      ? `data/level1/${language.value}/`
      : `data/level2-${stream.value}/${language.value}/`;

  const file = `mock${currentMock}.json`;

  try {
    const res = await fetch(base + file);
    if (!res.ok) throw "No more mocks";
    questions = await res.json();
  } catch {
    alert("All available mocks completed.");
    return;
  }

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll();
  show("quiz");
  startTimer();
  render();

  lockUI();
}

/* ---------- RENDER ---------- */
function render() {
  qCounter.innerText = `Q ${index + 1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((o, i) => {
    const b = document.createElement("button");
    b.innerText = o;
    if (answers[index] === i) b.classList.add("selected");
    b.onclick = () => { answers[index] = i; render(); };
    options.appendChild(b);
  });
}

function nextQ() { if (index < questions.length - 1) index++; render(); }
function prevQ() { if (index > 0) index--; render(); }

/* ---------- FINISH ---------- */
function finishQuiz() {
  clearInterval(timer);
  unlockUI();

  let correct = 0, wrong = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  const score = (correct - wrong / 3).toFixed(2);
  const u = JSON.parse(localStorage.getItem("usage"));

  u.tests++;
  u.mockIndex++;
  u.history.push({
    mock: currentMock,
    score,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("usage", JSON.stringify(u));

  const analytics = JSON.parse(localStorage.getItem("analytics"));
  analytics.totalAttempts++;
  localStorage.setItem("analytics", JSON.stringify(analytics));

  hideAll();
  show("result");

  resultTitle.innerText = language.value === "hindi" ? "परिणाम" : "Result";
  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText = motivation(score);
}

/* ---------- HISTORY ---------- */
function showHistory() {
  hideAll();
  show("history");

  const u = JSON.parse(localStorage.getItem("usage"));
  historyList.innerHTML = "";

  u.history.forEach(h => {
    const p = document.createElement("p");
    p.innerText = `Mock ${h.mock} – Score ${h.score} (${h.date})`;
    historyList.appendChild(p);
  });
}

/* ---------- MOTIVATION ---------- */
function motivation(score) {
  score = parseFloat(score);
  if (language.value === "hindi") {
    if (score > 30) return "बहुत बढ़िया! आप सही दिशा में हैं।";
    if (score > 20) return "अच्छा प्रयास, अभ्यास जारी रखें।";
    return "घबराएं नहीं, मेहनत से सफलता मिलेगी।";
  }
  return score > 30
    ? "Excellent! You are exam ready."
    : score > 20
    ? "Good attempt. Keep practicing."
    : "Don’t give up. Improvement is coming.";
}

/* ---------- TIMER ---------- */
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
    Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, "0");
}

/* ---------- UI LOCK ---------- */
function lockUI() {
  document.addEventListener("visibilitychange", warnExit);
  window.onblur = warnExit;
}
function unlockUI() {
  document.removeEventListener("visibilitychange", warnExit);
  window.onblur = null;
}
function warnExit() {
  alert("Please stay in the app during the test.");
}

/* ---------- HELPERS ---------- */
function hideAll() {
  ["login", "dashboard", "quiz", "result", "history"].forEach(id =>
    document.getElementById(id).style.display = "none"
  );
}
function show(id) { document.getElementById(id).style.display = "block"; }
function emailInput() { return document.getElementById("email").value; }

if (localStorage.getItem("user")) showDashboard();
