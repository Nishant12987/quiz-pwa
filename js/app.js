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
  const agree = document.getElementById("agree");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!agree.checked) return alert("Accept policies");
  if (!email || !password) return alert("Enter email & password");

  auth.signInWithEmailAndPassword(email, password)
    .then(res => afterLogin(res.user))
    .catch(err => {
      if (err.code === "auth/user-not-found") {
        auth.createUserWithEmailAndPassword(email, password)
          .then(res => afterLogin(res.user))
          .catch(e => alert(e.message));
      } else { alert(err.message); }
    });
}

function afterLogin(user) {
  const ref = db.collection("users").doc(user.uid);
  ref.get().then(doc => {
    if (!doc.exists) {
      ref.set({
        email: user.email,
        name: "",
        selection: null,
        paid: user.email === ADMIN_EMAIL,
        history: { level1: [], level2_social: [], level2_socio: [] }
      }).then(() => { hideAll(); show("nameSetup"); });
    } else { showDashboard(); }
  });
}

function saveName() {
  const name = document.getElementById("userNameInput").value.trim();
  if (!name) return alert("Enter name");
  db.collection("users").doc(auth.currentUser.uid).update({ name }).then(showDashboard);
}

/***********************
 * DASHBOARD & START FLOW
 ***********************/
function showDashboard() {
  hideAll();
  show("dashboard");
  const user = auth.currentUser;
  if (!user) return;

  const ref = db.collection("users").doc(user.uid);
  ref.get().then(doc => {
    const data = doc.data();
    document.getElementById("welcome").innerText = "👋 Welcome, " + (data.name || "User");
    document.getElementById("quoteBox").innerText = getQuote();
    document.getElementById("selectionBox").style.display = data.selection ? "none" : "block";
  });

  document.getElementById("level").onchange = () => {
    document.getElementById("stream").style.display = (document.getElementById("level").value === "level2") ? "block" : "none";
  };
  document.getElementById("startTestBtn").onclick = startFlow;
}

function startFlow() {
  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const data = doc.data();
    if (!data.selection) {
      const level = document.getElementById("level").value;
      const stream = document.getElementById("stream").value;
      const language = document.getElementById("language").value;
      if (!level || !language) return alert("Select all options");
      const selection = { level, stream: level === "level2" ? stream : "", language };
      ref.update({ selection }).then(() => { loadMock({ ...data, selection }); });
    } else { loadMock(data); }
  });
}

/***********************
 * LOAD MOCK (DETAILED ERRORS)
 ***********************/
async function loadMock(data) {
  const sel = data.selection;
  const key = sel.level === "level1" ? "level1" : (sel.stream === "social" ? "level2_social" : "level2_socio");
  const history = data.history || {};
  const pastTests = history[key] || [];

  if (data.paid !== true && pastTests.length >= 1) return alert("Payment required for more mock tests.");

  const folder = sel.level === "level1" ? "level1" : (sel.stream === "social" ? "level2-social" : "level2-socio");
  const mockNumber = pastTests.length + 1;
  const path = `data/${folder}/${sel.language}/mock${mockNumber}.json`;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Path: ${path}`);
    questions = await res.json();
    answers = Array(questions.length).fill(null);
    index = 0; timeLeft = 2400;
    hideAll(); show("quiz"); startTimer(); render();
  } catch (err) {
    alert(`No more mocks available.\nSection: ${folder}\nLanguage: ${sel.language}\nMock No: ${mockNumber}\nChecked: ${path}`);
  }
}

/***********************
 * QUIZ & TIMER
 ***********************/
function render() {
  document.getElementById("qCounter").innerText = `Q ${index + 1}/${questions.length}`;
  document.getElementById("question").innerText = questions[index].q;
  const opts = document.getElementById("options");
  opts.innerHTML = "";
  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    if (answers[index] === i) btn.classList.add("selected");
    btn.onclick = () => { answers[index] = i; render(); };
    opts.appendChild(btn);
  });
}

function nextQ() { if (index < questions.length - 1) { index++; render(); } }
function prevQ() { if (index > 0) { index--; render(); } }

function startTimer() {
  updateTime();
  timer = setInterval(() => {
    timeLeft--; updateTime();
    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function updateTime() {
  document.getElementById("time").innerText = Math.floor(timeLeft / 60) + ":" + String(timeLeft % 60).padStart(2, "0");
}

/***********************
 * FINISH & WAIT MESSAGE
 ***********************/
function finishQuiz() {
  clearInterval(timer);
  let correctCount = 0, wrongCount = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correctCount++;
    else if (a !== null) wrongCount++;
  });

  const score = (correctCount - (wrongCount / 3)).toFixed(2);
  const ref = db.collection("users").doc(auth.currentUser.uid);

  ref.get().then(doc => {
    const data = doc.data();
    const sel = data.selection;
    const key = sel.level === "level1" ? "level1" : (sel.stream === "social" ? "level2_social" : "level2_socio");
    const history = data.history || {};
    if (!history[key]) history[key] = [];
    
    history[key].push({
      score: score,
      date: new Date().toLocaleString(),
      questions: questions,
      userAnswers: [...answers]
    });

    ref.update({ history: history }).then(() => {
      hideAll(); show("result");
      document.getElementById("finalScore").innerText = `Score: ${score}`;
      
      // ✅ SUCCESS MESSAGE WITH WAIT ADVISORY
      setTimeout(() => {
        alert("Success! Your test is submitted. Practice takes time; please attempt the next mock after 2-3 hours for better results.");
      }, 500);
    });
  });
}

/***********************
 * HISTORY & REVIEW
 ***********************/
function showHistory() {
  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const data = doc.data();
    const sel = data.selection;
    if (!sel) return alert("No selection found");
    const key = sel.level === "level1" ? "level1" : (sel.stream === "social" ? "level2_social" : "level2_socio");
    const tests = data.history ? data.history[key] : [];

    hideAll(); show("history");
    const table = document.getElementById("historyTable");
    table.innerHTML = `<tr><th>Test</th><th>Score</th><th>Review</th></tr>`;
    
    tests.forEach((test, i) => {
      const row = table.insertRow();
      const displayScore = typeof test === 'object' ? test.score : test;
      row.innerHTML = `
        <td>Mock ${i+1}</td>
        <td>${displayScore}</td>
        <td><button class="primary" onclick="viewReview('${key}', ${i})">Review</button></td>
      `;
    });
  });
}

function viewReview(key, testIndex) {
  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const test = doc.data().history[key][testIndex];
    if (!test.questions) return alert("Review not available for this record.");
    
    hideAll(); show("review");
    const container = document.getElementById("reviewContainer");
    container.innerHTML = "";

    test.questions.forEach((q, i) => {
      const userAns = test.userAnswers[i];
      const div = document.createElement("div");
      div.className = "card";
      div.style.textAlign = "left";
      div.innerHTML = `<h4>Q${i+1}: ${q.q}</h4>`;
      
      q.options.forEach((opt, optIdx) => {
        const p = document.createElement("p");
        p.style.padding = "10px";
        p.style.borderRadius = "5px";
        p.innerText = opt;

        if (optIdx === q.a) {
          p.style.backgroundColor = "#dcfce7"; // Green Correct
          p.style.border = "1px solid green";
          p.innerHTML += " ✅ (Correct)";
        } else if (optIdx === userAns) {
          p.style.backgroundColor = "#fee2e2"; // Red Wrong
          p.style.border = "1px solid red";
          p.innerHTML += " ❌ (Your Answer)";
        } else {
          p.style.backgroundColor = "#f3f4f6";
        }
        div.appendChild(p);
      });
      container.appendChild(div);
    });
  });
}

/***********************
 * HELPERS
 ***********************/
function hideAll() {
  ["login","nameSetup","dashboard","quiz","result","history","review"].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = "none";
  });
}
function show(id) { const el = document.getElementById(id); if (el) el.style.display = "block"; }

auth.onAuthStateChanged(user => { if (user) showDashboard(); else { hideAll(); show("login"); } });
