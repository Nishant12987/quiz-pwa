let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;
let fiveMinWarned = false;

/* ================= LOGIN ================= */
function login() {
  if (!agree.checked) return alert("Accept policies");
  const email = emailInput.value.trim();
  if (!email) return alert("Enter email");

  localStorage.setItem("user_email", email);

  if (!localStorage.getItem("user_access")) {
    localStorage.setItem(
      "user_access",
      JSON.stringify({
        level: "",
        stream: "",
        language: "",
        paid: false,
        testsDone: 0,
        scores: []
      })
    );
  }
  showDashboard();
}

/* ================= DASHBOARD ================= */
function showDashboard() {
  hideAll();
  show("dashboard");

  const access = JSON.parse(localStorage.getItem("user_access"));
  welcome.innerText = "Welcome " + localStorage.getItem("user_email");

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };
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

  loadMock();
}

/* ================= LOAD MOCK ================= */
async function loadMock() {
  const access = JSON.parse(localStorage.getItem("user_access"));
  const mockNo = access.testsDone + 1;

  let folder =
    access.level === "level1"
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
    const b = document.createElement("button");
    b.innerText = opt;
    if (answers[index] === i) b.classList.add("selected");
    b.onclick = () => {
      answers[index] = i;
      render();
    };
    options.appendChild(b);
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

/* ================= FINISH ================= */
function finishQuiz() {
  clearInterval(timer);

  let correct = 0,
    wrong = 0;

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
  finalScore.innerText = `Score: ${score}`;
}

/* ================= HISTORY ================= */
function showHistory() {
  hideAll();
  show("history");

  const access = JSON.parse(localStorage.getItem("user_access"));
  historyTable.innerHTML =
    "<tr><th>Test</th><th>Score</th></tr>" +
    access.scores
      .map((s, i) => `<tr><td>Mock ${i + 1}</td><td>${s}</td></tr>`)
      .join("");
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

/* ================= HELPERS ================= */
function hideAll() {
  ["login", "dashboard", "quiz", "result", "history"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

/* ================= AUTO LOGIN ================= */
if (localStorage.getItem("user_email")) showDashboard();
