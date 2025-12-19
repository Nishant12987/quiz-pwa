/***********************
 * GLOBAL STATE
 ***********************/
let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

const ADMIN_EMAIL = "nishantameta1@gmail.com";

/***********************
 * MOTIVATIONAL QUOTES
 ***********************/
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

/***********************
 * AUTH
 ***********************/
function login() {
  if (!agree.checked) return alert("Accept policies");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Enter email & password");

  auth.signInWithEmailAndPassword(email, password)
    .then(res => afterLogin(res.user))
    .catch(err => {
      if (err.code === "auth/user-not-found") {
        auth.createUserWithEmailAndPassword(email, password)
          .then(res => afterLogin(res.user));
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password");
      } else {
        alert(err.message);
      }
    });
}

function resetPassword() {
  const email = emailInput.value.trim();
  if (!email) return alert("Enter email");
  auth.sendPasswordResetEmail(email)
    .then(() => alert("Reset email sent"));
}

/***********************
 * AFTER LOGIN
 ***********************/
function afterLogin(user) {
  const ref = db.collection("users").doc(user.uid);

  ref.get().then(doc => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        name: "",
        selection: null,
        payments: {
          level1: user.email === ADMIN_EMAIL,
          level2_social: false,
          level2_socio: false
        },
        history: {
          level1: [],
          level2_social: [],
          level2_socio: []
        }
      });
      hideAll();
      show("nameSetup");
    } else {
      showDashboard();
    }
  });
}

/***********************
 * SAVE NAME (ONLY ONCE)
 ***********************/
function saveName() {
  const name = userNameInput.value.trim();
  if (!name) return alert("Enter name");

  db.collection("users")
    .doc(auth.currentUser.uid)
    .update({ name })
    .then(showDashboard);
}

/***********************
 * DASHBOARD
 ***********************/
function showDashboard() {
  hideAll();
  show("dashboard");

  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const data = doc.data();
    welcome.innerText = "👋 Welcome, " + data.name;
    quoteBox.innerText = getQuote();

    // 🔒 Selection only once
    if (data.selection) {
      selectionBox.style.display = "none";
    } else {
      selectionBox.style.display = "block";
    }
  });

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };
}

/***********************
 * START TEST
 ***********************/
function startFlow() {
  const ref = db.collection("users").doc(auth.currentUser.uid);

  ref.get().then(doc => {
    const data = doc.data();

    // First-time selection only
    if (!data.selection) {
      if (!level.value || !language.value)
        return alert("Select all options");
      if (level.value === "level2" && !stream.value)
        return alert("Select stream");

      data.selection = {
        level: level.value,
        stream: level.value === "level2" ? stream.value : "",
        language: language.value
      };

      ref.update({ selection: data.selection });
    }

    loadMock(data);
  });
}

/***********************
 * LOAD MOCK
 ***********************/
async function loadMock(data) {
  const sel = data.selection;

  const key =
    sel.level === "level1"
      ? "level1"
      : sel.stream === "social"
      ? "level2_social"
      : "level2_socio";

  // 🔒 Payment gate (stream locked)
  if (!data.payments[key] && data.history[key].length >= 1) {
    alert("Payment required for this stream");
    return;
  }

  const folder =
    sel.level === "level1"
      ? "level1"
      : sel.stream === "social"
      ? "level2-social"
      : "level2-socio";

  const path = `data/${folder}/${sel.language}/mock${data.history[key].length + 1}.json`;

  try {
    const res = await fetch(path);
    questions = await res.json();
  } catch {
    alert("No more mocks available");
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

/***********************
 * VIEW HISTORY
 ***********************/
function showHistory() {
  const ref = db.collection("users").doc(auth.currentUser.uid);

  ref.get().then(doc => {
    const data = doc.data();
    if (!data.selection) return alert("No history");

    const sel = data.selection;
    const key =
      sel.level === "level1"
        ? "level1"
        : sel.stream === "social"
        ? "level2_social"
        : "level2_socio";

    if (!data.payments[key]) {
      alert("Payment required to view history");
      return;
    }

    hideAll();
    show("history");

    historyTable.innerHTML =
      "<tr><th>Test</th><th>Score</th></tr>" +
      data.history[key]
        .map((s, i) => `<tr><td>Mock ${i + 1}</td><td>${s}</td></tr>`)
        .join("");
  });
}

/***********************
 * QUIZ LOGIC
 ***********************/
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
  if (index < questions.length - 1) index++;
  render();
}

function prevQ() {
  if (index > 0) index--;
  render();
}

/***********************
 * TIMER
 ***********************/
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

/***********************
 * FINISH QUIZ
 ***********************/
function finishQuiz() {
  clearInterval(timer);

  let correct = 0, wrong = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  const score = (correct - wrong / 3).toFixed(2);

  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const data = doc.data();
    const sel = data.selection;

    const key =
      sel.level === "level1"
        ? "level1"
        : sel.stream === "social"
        ? "level2_social"
        : "level2_socio";

    data.history[key].push(score);
    ref.update({ history: data.history });
  });

  hideAll();
  show("result");

  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText = "Test submitted successfully";
}

/***********************
 * HELPERS
 ***********************/
function hideAll() {
  ["login","nameSetup","dashboard","quiz","result","history"]
    .forEach(id => document.getElementById(id).style.display = "none");
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

/***********************
 * AUTO LOGIN
 ***********************/
auth.onAuthStateChanged(user => {
  if (user) showDashboard();
});
