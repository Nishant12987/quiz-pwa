/* ---------------- QUESTIONS ---------------- */
const papers = {
  reet: Array.from({ length: 40 }, (_, i) => ({
    q: `REET Practice Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    a: Math.floor(Math.random() * 4)
  }))
};

let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

/* ---------------- AUTH ---------------- */
function login() {
  const email = emailInput();
  if (!email) return alert("Enter email");
  localStorage.setItem("user", email);

  if (!localStorage.getItem("daily")) {
    localStorage.setItem("daily", JSON.stringify({
      date: today(),
      used: 0,
      scores: []
    }));
  }

  if (!localStorage.getItem("history")) {
    localStorage.setItem("history", JSON.stringify([]));
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
  show("dashboard");

  welcome.innerText = "Welcome " + localStorage.getItem("user");

  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.date !== today()) {
    localStorage.setItem("lastDayScore", avg(daily.scores));
    daily = { date: today(), used: 0, scores: [] };
    localStorage.setItem("daily", JSON.stringify(daily));
  }

  limit.innerText = `Tests left today: ${2 - daily.used}`;

  const y = localStorage.getItem("lastDayScore") || 0;
  const t = avg(daily.scores);
  progress.innerText = `Yesterday: ${y}% | Today: ${t}%`;
  rating.innerText = `Preparation: ${getRating(t)}`;
  breakMsg.innerText = daily.used === 1 ? "Take a 2–3 hour break." : "";
}

/* ---------------- INSTRUCTIONS ---------------- */
function showInstructions() {
  hideAll();
  show("instructions");
}

/* ---------------- QUIZ ---------------- */
function startQuiz() {
  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.used >= 2) return alert("Daily limit reached");

  questions = papers.reet;
  answers = Array(40).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

function render() {
  qCounter.innerText = `Question ${index + 1} / 40`;
  question.innerText = questions[index].q;
  options.innerHTML = "";
  progressBar.style.width = ((index + 1) / 40) * 100 + "%";

  questions[index].options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.innerText = opt;
    if (answers[index] === i) b.classList.add("correct");
    b.onclick = () => {
      answers[index] = i;
      render();
    };
    options.appendChild(b);
  });
}

function nextQ() { if (index < 39) { index++; render(); } }
function prevQ() { if (index > 0) { index--; render(); } }

/* ---------------- FINISH ---------------- */
function finishQuiz() {
  const unattempted = answers.filter(a => a === null).length;
  if (unattempted > 0 && !confirm(`You have ${unattempted} unattempted questions. Submit?`)) return;
  if (!confirm("Are you sure you want to submit the test?")) return;

  clearInterval(timer);

  let correct = 0, wrong = 0, skipped = 0;
  answers.forEach((a, i) => {
    if (a === null) skipped++;
    else if (a === questions[i].a) correct++;
    else wrong++;
  });

  let score = correct - (wrong / 3);
  score = Math.max(0, score);
  score = Number(score.toFixed(2));
  const percent = Number(((score / 40) * 100).toFixed(2));

  let daily = JSON.parse(localStorage.getItem("daily"));
  daily.used++;
  daily.scores.push(percent);
  localStorage.setItem("daily", JSON.stringify(daily));

  let history = JSON.parse(localStorage.getItem("history"));
  history.push({
    date: new Date().toISOString(),
    correct, wrong, skipped, score, percent,
    answers, questions
  });
  localStorage.setItem("history", JSON.stringify(history));

  showResult(correct, wrong, skipped, score, percent);
}

/* ---------------- TIMER ---------------- */
function startTimer() {
  updateTime();
  timer = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) {
      alert("Time up! Test auto-submitted.");
      finishQuiz();
    }
  }, 1000);
}

function updateTime() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  time.innerText = `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---------------- RESULT ---------------- */
function showResult(correct, wrong, skipped, score, percent) {
  hideAll();
  show("result");

  finalScore.innerText = `Score: ${score} / 40 (${percent}%)`;
  counts.innerText = `Correct: ${correct} | Wrong: ${wrong} | Skipped: ${skipped}`;
  finalRating.innerText = `Preparation: ${getRating(percent)}`;

  review.innerHTML = "";
  questions.forEach((q, i) => {
    let html = `<div class="review-item"><b>Q${i + 1}</b> ${q.q}<br>`;
    q.options.forEach((opt, idx) => {
      let cls = "";
      if (idx === q.a) cls = "correct";
      if (answers[i] === idx && idx !== q.a) cls = "wrong";
      html += `<div class="${cls}">${opt}</div>`;
    });
    html += "</div>";
    review.innerHTML += html;
  });
}

/* ---------------- HISTORY ---------------- */
function showHistory() {
  hideAll();
  show("history");

  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history") || "[]");

  history.slice(-365).reverse().forEach((h, i) => {
    list.innerHTML += `
      <div class="review-item">
        <b>Test ${history.length - i}</b><br>
        Date: ${new Date(h.date).toLocaleString()}<br>
        Score: ${h.score} / 40 (${h.percent}%)
      </div>
    `;
  });
}

/* ---------------- UTIL ---------------- */
function hideAll() {
  ["login","dashboard","instructions","quiz","result","history"].forEach(id => hide(id));
}
function hide(id){ document.getElementById(id).style.display="none"; }
function show(id){ document.getElementById(id).style.display="block"; }
function today(){ return new Date().toDateString(); }
function emailInput(){ return document.getElementById("email").value; }
function avg(a){ return a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : 0; }
function getRating(p){
  if (p >= 80) return "Excellent";
  if (p >= 60) return "Good";
  if (p >= 40) return "Improving";
  return "Beginner";
}

if (localStorage.getItem("user")) showDashboard();
