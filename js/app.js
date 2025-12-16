// QUIZ DATA
const questions = [
  {
    q: "2 + 2 = ?",
    options: ["1", "2", "3", "4"],
    a: 3
  },
  {
    q: "Capital of India?",
    options: ["Mumbai", "Delhi", "Chennai", "Kolkata"],
    a: 1
  }
];

let index = 0;
let score = 0;

/* ---------------- LOGIN ---------------- */

function login() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if (!localStorage.getItem("daily")) {
    localStorage.setItem("daily", JSON.stringify({
      date: today(),
      used: 0
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
  hide("login");
  hide("quiz");
  show("dashboard");

  const email = localStorage.getItem("user");
  document.getElementById("welcome").innerText = "Welcome " + email;

  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.date !== today()) {
    daily = { date: today(), used: 0 };
    localStorage.setItem("daily", JSON.stringify(daily));
  }

  document.getElementById("limit").innerText =
    "Tests left today: " + (2 - daily.used);
}

/* ---------------- QUIZ ---------------- */

function startQuiz() {
  const daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.used >= 2) return alert("Daily limit reached");

  hide("dashboard");
  show("quiz");

  index = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  const q = questions[index];
  document.getElementById("question").innerText = q.q;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => {
      if (i === q.a) score++;
    };
    optionsDiv.appendChild(btn);
  });
}

function next() {
  index++;

  if (index >= questions.length) {
    let daily = JSON.parse(localStorage.getItem("daily"));
    daily.used++;
    localStorage.setItem("daily", JSON.stringify(daily));

    alert(
      "Quiz Finished!\n\nYour Score: " +
      score + " / " + questions.length
    );

    showDashboard();
  } else {
    showQuestion();
  }
}

/* ---------------- HELPERS ---------------- */

function today() {
  return new Date().toDateString();
}

function hide(id) {
  document.getElementById(id).style.display = "none";
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

/* ---------------- AUTO LOGIN ---------------- */

if (localStorage.getItem("user")) {
  showDashboard();
}

