/***********************
 * GLOBAL STATE
 ***********************/
let questions = [];
let answers = []; // Stores indices of user-selected options
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
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password");
      } else {
        alert(err.message);
      }
    });
}

function resetPassword() {
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter email");

  auth.sendPasswordResetEmail(email)
    .then(() => alert("Reset email sent"))
    .catch(err => alert(err.message));
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
        paid: user.email === ADMIN_EMAIL, 
        history: {
          level1: [],
          level2_social: [],
          level2_socio: []
        }
      }).then(() => {
        hideAll();
        show("nameSetup");
      });
    } else {
      showDashboard();
    }
  });
}

/***********************
 * SAVE NAME
 ***********************/
function saveName() {
  const name = document.getElementById("userNameInput").value.trim();
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

  const user = auth.currentUser;
  if (!user) return;

  const ref = db.collection("users").doc(user.uid);
  ref.get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();

    document.getElementById("welcome").innerText = "👋 Welcome, " + (data.name || "User");
    document.getElementById("quoteBox").innerText = getQuote();
    document.getElementById("selectionBox").style.display = data.selection ? "none" : "block";
  });

  const levelSelect = document.getElementById("level");
  levelSelect.onchange = () => {
    document.getElementById("stream").style.display = (levelSelect.value === "level2") ? "block" : "none";
  };

  document.getElementById("startTestBtn").onclick = startFlow;
  
  const histBtn = document.querySelector("button[onclick='showHistory()']");
  if (histBtn) histBtn.onclick = showHistory;
}

/***********************
 * START TEST FLOW
 ***********************/
function startFlow() {
  const user = auth.currentUser;
  if (!user) return alert("User not logged in");

  const ref = db.collection("users").doc(user.uid);

  ref.get().then(doc => {
    if (!doc.exists) return alert("User data missing");
    const data = doc.data();

    if (!data.selection) {
      const level = document.getElementById("level").value;
      const stream = document.getElementById("stream").value;
      const language = document.getElementById("language").value;

      if (!level || !language) return alert("Select all options");
      if (level === "level2" && !stream) return alert("Select stream");

      const selection = {
        level,
        stream: level === "level2" ? stream : "",
        language
      };

      ref.update({ selection }).then(() => {
        ref.get().then(updated => loadMock(updated.data()));
      });
    } else {
      loadMock(data);
    }
  });
}

/***********************
 * LOAD MOCK
 ***********************/
async function loadMock(data) {
  if (!data || !data.selection) return alert("Selection missing");

  const sel = data.selection;
  const key = sel.level === "level1" ? "level1" : 
              (sel.stream === "social" ? "level2_social" : "level2_socio");

  const isPaid = data.paid === true;
  const history = data.history || {};
  const currentHistory = history[key] || [];

  if (!isPaid && currentHistory.length >= 1) {
    alert("Payment required for more mock tests in this stream.");
    return;
  }

  const folder = sel.level === "level1" ? "level1" : 
                 (sel.stream === "social" ? "level2-social" : "level2-socio");

  const mockNumber = currentHistory.length + 1;
  const path = `data/${folder}/${sel.language}/mock${mockNumber}.json`;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    questions = await res.json();
  } catch {
    alert("No more mocks available for this selection.");
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
 * HISTORY (UPDATED WITH REVIEW BUTTON)
 ***********************/
function showHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = db.collection("users").doc(user.uid);
  ref.get().then(doc => {
    const data = doc.data();
    if (!data.selection) return alert("You must complete a test first to see history.");

    const sel = data.selection;
    const key = sel.level === "level1" ? "level1" : 
                (sel.stream === "social" ? "level2_social" : "level2_socio");

    if (data.paid !== true) return alert("Payment required to view history");

    const history = data.history || {};
    const tests = history[key] || [];

    if (tests.length === 0) return alert("No test history found yet.");

    hideAll();
    show("history");

    document.getElementById("historyTable").innerHTML =
      "<tr><th>Test</th><th>Score</th><th>Review</th></tr>" +
      tests.map((test, i) => {
        // Support both old string scores and new object history
        const score = typeof test === 'object' ? test.score : test;
        return `<tr>
          <td>Mock ${i + 1}</td>
          <td>${score}</td>
          <td><button class="primary" onclick="viewReview('${key}', ${i})">Review</button></td>
        </tr>`;
      }).join("");
  });
}

/***********************
 * TEST REVIEW (NEW)
 ***********************/
function viewReview(key, testIndex) {
  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const test = doc.data().history[key][testIndex];
    
    if (!test.questions || !test.userAnswers) {
      return alert("Review not available for this older test record.");
    }

    hideAll();
    show("review");
    
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
        p.style.padding = "12px";
        p.style.margin = "5px 0";
        p.style.borderRadius = "8px";
        p.innerText = opt;

        if (optIdx === q.a) {
          // Correct Answer - Green
          p.style.backgroundColor = "#dcfce7"; 
          p.style.border = "2px solid #22c55e";
          p.innerHTML += " ✅ (Correct Answer)";
        } else if (optIdx === userAns) {
          // User's Wrong Answer - Red
          p.style.backgroundColor = "#fee2e2"; 
          p.style.border = "2px solid #ef4444";
          p.innerHTML += " ❌ (Your Choice)";
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
 * QUIZ LOGIC
 ***********************/
function render() {
  document.getElementById("qCounter").innerText = `Q ${index + 1}/${questions.length}`;
  document.getElementById("question").innerText = questions[index].q;

  const options = document.getElementById("options");
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
  if (timer) clearInterval(timer);
  updateTime();
  timer = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function updateTime() {
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");
  document.getElementById("time").innerText = `${mins}:${secs}`;
}

/***********************
 * FINISH QUIZ (UPDATED TO SAVE REVIEW DATA)
 ***********************/
function finishQuiz() {
  clearInterval(timer);

  let correct = 0, wrong = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  const score = (correct - (wrong / 3)).toFixed(2);

  const ref = db.collection("users").doc(auth.currentUser.uid);
  ref.get().then(doc => {
    const data = doc.data();
    const sel = data.selection;
    const key = sel.level === "level1" ? "level1" : 
                (sel.stream === "social" ? "level2_social" : "level2_socio");

    const history = data.history || {};
    if (!history[key]) history[key] = [];
    
    // ✅ SAVE FULL TEST DETAILS FOR REVIEW
    history[key].push({
      score: score,
      questions: questions, // Store questions used in this specific test
      userAnswers: [...answers], // Store what user marked
      date: new Date().toLocaleString()
    });

    ref.update({ history: history });
  });

  hideAll();
  show("result");
  document.getElementById("finalScore").innerText = `Score: ${score}/${questions.length}`;
  document.getElementById("finalMsg").innerText = "Test submitted successfully";
}

/***********************
 * HELPERS
 ***********************/
function hideAll() {
  ["login","nameSetup","dashboard","quiz","result","history","review"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

/***********************
 * AUTO LOGIN
 ***********************/
auth.onAuthStateChanged(user => {
  if (user) showDashboard();
  else {
    hideAll();
    show("login");
  }
});
