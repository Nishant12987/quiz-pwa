/* ---------------- QUESTIONS (40 SAMPLE) ---------------- */
const questions = Array.from({ length: 40 }, (_, i) => ({
  q: `Sample Question ${i + 1}?`,
  options: ["Option A", "Option B", "Option C", "Option D"],
  a: Math.floor(Math.random() * 4)
}));

let index = 0;
let answers = Array(40).fill(null);

/* ---------------- LOGIN ---------------- */
function login() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if (!localStorage.getItem("daily")) {
    localStorage.setItem("daily", JSON.stringify({
      date: today(),
      used: 0,
      scores: []
    }));
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

  welcome.innerText = "Hello, " + localStorage.getItem("user");

  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.date !== today()) {
    localStorage.setItem("lastDayScore", avg(daily.scores));
    daily = { date: today(), used: 0, scores: [] };
    localStorage.setItem("daily", JSON.stringify(daily));
  }

  limit.innerText = 2 - daily.used;

  const yesterday = localStorage.getItem("lastDayScore") || 0;
  const todayAvg = avg(daily.scores);
  const improvement = yesterday ? (((todayAvg - yesterday) / yesterday) * 100).toFixed(1) : 0;

  progress.innerText =
    `Yesterday: ${yesterday}% | Today: ${todayAvg}% | Improvement: ${improvement}%`;

  rating.innerText = getRating(todayAvg);

  breakMsg.innerText =
    daily.used === 1 ? "⏳ Take a 2–3 hour break before the next test." : "";
}

/* ---------------- QUIZ ---------------- */
function startQuiz() {
  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.used >= 2) return alert("Daily limit reached");

  hideAll();
  show("quiz");

  index = 0;
  answers.fill(null);
  renderQuestion();
}

function renderQuestion() {
  qCounter.innerText = `Question ${index + 1} of 40`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  progressBar.style.width = `${((index + 1) / 40) * 100}%`;

  questions[index].options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.innerText = opt;
    if (answers[index] === i) b.style.background = "#0a5cff", b.style.color = "white";
    b.onclick = () => {
      answers[index] = i;
      renderQuestion();
    };
    options.appendChild(b);
  });
}

function nextQ() {
  if (index < 39) index++;
  renderQuestion();
}

function prevQ() {
  if (index > 0) index--;
  renderQuestion();
}

function finishQuiz() {
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

/* ---------------- RESULT ---------------- */
function showResult(score, percent) {
  hideAll();
  show("result");

  finalScore.innerText = `Score: ${score}/40 (${percent}%)`;

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

/* ---------------- HELPERS ---------------- */
function hideAll() {
  ["login","dashboard","quiz","result"].forEach(hide);
}
function hide(id){ document.getElementById(id).style.display="none"; }
function show(id){ document.getElementById(id).style.display="block"; }
function today(){ return new Date().toDateString(); }
function avg(arr){ return arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0; }
function getRating(p){
  if(p>=80) return "Excellent";
  if(p>=60) return "Good";
  if(p>=40) return "Improving";
  return "Beginner";
}

if (localStorage.getItem("user")) showDashboard();


