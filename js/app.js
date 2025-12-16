const questions = [
  { q: "2 + 2 = ?", options: ["1","2","3","4"], a: 3 },
  { q: "Capital of India?", options: ["Mumbai","Delhi","Chennai","Kolkata"], a: 1 }
];

let index = 0;
let score = 0;

function login() {
  const email = emailInput();
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

function showDashboard() {
  hide("login");
  show("dashboard");

  const email = localStorage.getItem("user");
  welcome.innerText = "Welcome " + email;

  let daily = JSON.parse(localStorage.getItem("daily"));
  if (daily.date !== today()) {
    daily = { date: today(), used: 0 };
    localStorage.setItem("daily", JSON.stringify(daily));
  }

  limit.innerText = "Tests left today: " + (2 - daily.used);
}

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
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.innerText = opt;
    b.onclick = () => {
      if (i === questions[index].a) score++;
      scoreBox();
    };
    options.appendChild(b);
  });
}

function next() {
  index++;
  if (index >= questions.length) {
    let daily = JSON.parse(localStorage.getItem("daily"));
    daily.used++;
    localStorage.setItem("daily", JSON.stringify(daily));
    alert("Quiz finished. Score: " + score);
    location.reload();
  } else showQuestion();
}

/* helpers */
function today(){ return new Date().toDateString(); }
function hide(id){ document.getElementById(id).style.display="none"; }
function show(id){ document.getElementById(id).style.display="block"; }
function emailInput(){ return document.getElementById("email").value; }
function scoreBox(){ document.getElementById("score").innerText="Score: "+score; }

if (localStorage.getItem("user")) showDashboard();
