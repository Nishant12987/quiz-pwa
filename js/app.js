let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

/* ---------------- LOGIN ---------------- */
function login() {
  if (!agree.checked) return alert("Accept policies");
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter email");

  localStorage.setItem("user_email", email);

  // Create access record if first time
  if (!localStorage.getItem("user_access")) {
    localStorage.setItem(
      "user_access",
      JSON.stringify({
        level: "",
        stream: "",
        language: "",
        paid: false,
        testsDone: 0
      })
    );
  }

  showDashboard();
}

/* ---------------- DASHBOARD ---------------- */
function showDashboard() {
  hideAll();
  show("dashboard");

  const access = JSON.parse(localStorage.getItem("user_access"));
  welcome.innerText = "Welcome " + localStorage.getItem("user_email");

  // If already selected once → LOCK selection forever
  if (access.level) {
    document.getElementById("selectionBox").style.display = "none";
    limit.innerText = access.paid
      ? `Paid access: ${access.level.toUpperCase()} ${access.language.toUpperCase()}`
      : "1 free mock remaining";
  } else {
    document.getElementById("selectionBox").style.display = "block";
    limit.innerText = "Choose your exam (one-time only)";
  }

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };
}

/* ---------------- START FLOW ---------------- */
function startFlow() {
  let access = JSON.parse(localStorage.getItem("user_access"));

  // FIRST TIME SELECTION
  if (!access.level) {
    if (!level.value || !language.value)
      return alert("Select all options");

    if (level.value === "level2" && !stream.value)
      return alert("Select stream");

    access.level = level.value;
    access.stream = level.value === "level2" ? stream.value : "";
    access.language = language.value;

    localStorage.setItem("user_access", JSON.stringify(access));
  }

  // ACCESS CONTROL
  if (!access.paid && access.testsDone >= 1) {
    alert("Free test over. Purchase required for this selection.");
    window.open("https://razorpay.me/@prepone", "_blank");
    return;
  }

  loadMock();
}

/* ---------------- LOAD MOCK ---------------- */
async function loadMock() {
  const access = JSON.parse(localStorage.getItem("user_access"));
  const mockNo = access.testsDone + 1;

  const path = `data/${access.level}/${access.language}/${
    access.level === "level2" ? access.stream + "/" : ""
  }mock${mockNo}.json`;

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

/* ---------------- RENDER ---------------- */
function render() {
  qCounter.innerText = `Q ${index + 1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
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

/* ---------------- FINISH ---------------- */
function finishQuiz() {
  clearInterval(timer);

  let correct = 0,
    wrong = 0;

  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  let score = (correct - wrong / 3).toFixed(2);

  let access = JSON.parse(localStorage.getItem("user_access"));
  access.testsDone++;
  localStorage.setItem("user_access", JSON.stringify(access));

  hideAll();
  show("result");

  resultTitle.innerText =
    access.language === "hindi" ? "परिणाम" : "Result";

  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText =
    score >= 30
      ? "Excellent! You are exam ready."
      : "Keep practicing. You will improve.";
}

/* ---------------- TIMER ---------------- */
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

/* ---------------- HELPERS ---------------- */
function hideAll() {
  ["login", "dashboard", "quiz", "result"].forEach(
    (id) => (document.getElementById(id).style.display = "none")
  );
}
function show(id) {
  document.getElementById(id).style.display = "block";
}

if (localStorage.getItem("user_email")) showDashboard();
