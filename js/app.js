let currentQ = 0;
let answers = [];
let paid = localStorage.getItem("paid") === "true";
let testCount = Number(localStorage.getItem("testsGiven") || 0);
let timeLeft = 2400;
let timer;
let switchCount = 0;

const questions = [
  { q: "Sample Question?", options: ["A","B","C","D"], a: 0 }
];

function login() {
  localStorage.setItem("user", email.value);
  showDashboard();
}

function showDashboard() {
  hideAll();
  dashboard.style.display = "block";
  welcome.innerText = "Welcome " + localStorage.getItem("user");

  accessInfo.innerText = paid
    ? "Full access unlocked"
    : "1 free test available";
}

function startFlow() {
  if (!paid && testCount >= 1) {
    hideAll();
    paywall.style.display = "block";
  } else {
    startQuiz();
  }
}

function startQuiz() {
  hideAll();
  quiz.style.display = "block";
  currentQ = 0;
  answers = [];
  startTimer();
  render();
}

function render() {
  qCounter.innerText = `Q ${currentQ + 1}`;
  question.innerText = questions[currentQ].q;
  options.innerHTML = "";
  questions[currentQ].options.forEach((o, i) => {
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = () => {
      answers[currentQ] = i;
      nextQ();
    };
    options.appendChild(b);
  });
}

function nextQ() {
  if (currentQ < questions.length - 1) {
    currentQ++;
    render();
  } else {
    finish();
  }
}

function finish() {
  clearInterval(timer);
  testCount++;
  localStorage.setItem("testsGiven", testCount);
  hideAll();
  result.style.display = "block";

  let score = answers.filter((a,i)=>a===questions[i].a).length;

  scoreText.innerText = `Score: ${score}/${questions.length}`;

  motivation.innerText =
    score >= 30 ? "Excellent! Keep it up 💪" :
    score >= 20 ? "Good effort! Improve more 👍" :
    "Keep practicing! You can do better 🔥";
}

function startTimer() {
  timeLeft = 2400;
  timer = setInterval(() => {
    timeLeft--;
    time.innerText = `${Math.floor(timeLeft/60)}:${timeLeft%60}`;
    if (timeLeft <= 0) finish();
  },1000);
}

/* SECURITY: TAB SWITCH */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    switchCount++;
    alert("Do not switch tabs during test");
    if (switchCount >= 3) {
      alert("Test auto-submitted");
      finish();
    }
  }
});

/* PAYMENT */
function payNow() {
  const options = {
    key: "RAZORPAY_KEY_HERE",
    amount: 14900,
    currency: "INR",
    name: "REET Test Series",
    description: "Full Access",
    handler: function () {
      localStorage.setItem("paid", "true");
      paid = true;
      alert("Payment successful");
      showDashboard();
    }
  };
  new Razorpay(options).open();
}

function hideAll() {
  ["login","dashboard","quiz","result","paywall"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
}

if (localStorage.getItem("user")) showDashboard();
