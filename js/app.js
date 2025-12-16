/* ======================================================
   REET PRACTICE APP – FINAL HARDENED VERSION
   ====================================================== */

/* ---------------- QUESTIONS (REET ONLY – SAMPLE) ---------------- */
const papers = {
  reet: Array.from({ length: 40 }, (_, i) => ({
    q: `REET Practice Question ${i + 1}?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    a: Math.floor(Math.random() * 4)
  }))
};

let questions = [];
let answers = [];
let index = 0;
let timer = null;
let timeLeft = 40 * 60; // 40 minutes

/* ---------------- LOGIN ---------------- */

function login() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if (!localStorage.getItem("daily")) {
    localStorage.setItem(
      "daily",
      JSON.stringify({ date: today(), used: 0, scores: [] })
    );
  }

  showDashboard();
}

function logout() {
  localStorage.clear();
  location.reload();
}

/* ---------------- DASHBOARD ---------------- */

function showDashboard() {
  hideAll();
  document.getElementById("dashboard").style.display = "block";

  document.getElementById("welcome").innerText =
    "Hello, " + localStorage.getItem("user");

  let daily = JSON.parse(localStorage.getItem("daily"));

  // Reset day if needed
  if (daily.date !== today()) {
    localStorage.setItem("lastDayScore", avg(daily.scores));
    daily = { date: today(), used: 0, scores: [] };
    localStorage.setItem("daily", JSON.stringify(daily));
  }

  const isPremium = localStorage.getItem("premium") === "true";

  document.getElementById("limit").innerText = isPremium
    ? "Unlimited tests (Full Course)"
    : `Tests left today: ${2 - daily.used}`;

  const yesterday = localStorage.getItem("lastDayScore") || 0;
  const todayAvg = avg(daily.scores);

  document.getElementById("progress").innerText =
    `Yesterday: ${yesterday}% | Today: ${todayAvg}%`;

  document.getElementById("rating").innerText =
    `Preparation Level: ${getRating(todayAvg)}`;

  document.getElementById("breakMsg").innerText =
    daily.used === 1 ? "⏳ Take a 2–3 hour break before next test." : "";

  // Ads logic
  const adBox = document.getElementById("adBox");
  if (adBox) adBox.style.display = isPremium ? "none" : "block";
}

/* ---------------- INSTRUCTIONS ---------------- */

function showInstructions() {
  hideAll();
  document.getElementById("instructions").style.display = "block";
}

/* ---------------- QUIZ START ---------------- */

function startQuiz() {
  let daily = JSON.parse(localStorage.getItem("daily"));
  const isPremium = localStorage.getItem("premium") === "true";

  if (!isPremium && daily.used >= 2) {
    alert("Daily limit reached. Unlock full course for unlimited tests.");
    return;
  }

  questions = papers.reet;
  answers = Array(40).fill(null);
  index = 0;
  timeLeft = 40 * 60;

  hideAll();
  document.getElementById("quiz").style.display = "block";

  startTimer();
  renderQuestion();
}

/* ---------------- RENDER QUESTION ---------------- */

function renderQuestion() {
  document.getElementById("qCounter").innerText =
    `Question ${index + 1} of 40`;

  document.getElementById("question").innerText =
    questions[index].q;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  document.getElementById("progressBar").style.width =
    `${((index + 1) / 40) * 100}%`;

  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;

    if (answers[index] === i) {
      btn.style.background = "#0a5cff";
      btn.style.color = "white";
    }

    btn.onclick = () => {
      answers[index] = i;
      renderQuestion();
    };

    optionsDiv.appendChild(btn);
  });
}

function nextQ() {
  if (index < 39) {
    index++;
    renderQuestion();
  }
}

function prevQ() {
  if (index > 0) {
    index--;
    renderQuestion();
  }
}

/* ---------------- FINISH QUIZ (HARDENED) ---------------- */

function finishQuiz() {
  const unattempted = answers.filter(a => a === null).length;

  if (unattempted > 0) {
    const proceed = confirm(
      `You have ${unattempted} unattempted questions.\n\nDo you still want to submit the test?`
    );
    if (!proceed) return;
  }

  const finalConfirm = confirm(
    "Are you sure you want to finish and submit the test?"
  );
  if (!finalConfirm) return;

  clearInterval(timer);

  let score = 0;
  answers.forEach((a, i) => {
    if (a === questions[i].a) score++;
  });

  const percent = Math.round((score / 40) * 100);

  let daily = JSON.parse(localStorage.getItem("daily"));
  daily.used++;
  daily.scores.push(percent);
  localStorage.setItem("daily", JSON.stringify(daily));

  showResult(score, percent);
}

/* ---------------- TIMER ---------------- */

function startTimer() {
  updateTime();
  timer = setInterval(() => {
    timeLeft--;
    updateTime();

    if (timeLeft <= 0) {
      alert("Time is up! Test will be submitted automatically.");
      finishQuiz();
    }
  }, 1000);
}

function updateTime() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("time").innerText =
    `${min}:${sec.toString().padStart(2, "0")}`;
}

/* ---------------- RESULT ---------------- */

function showResult(score, percent) {
  hideAll();
  document.getElementById("result").style.display = "block";

  document.getElementById("finalScore").innerText =
    `Score: ${score}/40 (${percent}%)`;

  const review = document.getElementById("review");
  review.innerHTML = "";

  questions.forEach((q, i) => {
    review.innerHTML += `
      <div class="review">
        <b>Q${i + 1}:</b> ${q.q}<br>
        Your Answer: ${q.options[answers[i]] ?? "Skipped"}<br>
        Correct Answer: ${q.options[q.a]}
      </div>
    `;
  });
}

/* ---------------- UTILITIES ---------------- */

function hideAll() {
  ["login", "dashboard", "instructions", "quiz", "result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function today() {
  return new Date().toDateString();
}

function avg(arr) {
  return arr.length
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    : 0;
}

function getRating(p) {
  if (p >= 80) return "Excellent";
  if (p >= 60) return "Good";
  if (p >= 40) return "Improving";
  return "Beginner";
}

/* ---------------- INIT ---------------- */

if (localStorage.getItem("user")) {
  showDashboard();
}
