const PRICE = 149;
const PAYMENT_LINK = "https://razorpay.me/@prepone";

let questions = [
  { q: "Sample Question?", options: ["A","B","C","D"], a: 0 }
];

let answers = [];
let index = 0;
let timeLeft = 2400;
let timer;

/* LOGIN */
function login() {
  if (!agree.checked) {
    alert("Please agree to policies");
    return;
  }

  localStorage.setItem("user", email.value);
  localStorage.setItem("lang", language.value);

  if (!localStorage.getItem("testsGiven"))
    localStorage.setItem("testsGiven", "0");

  if (!localStorage.getItem("history"))
    localStorage.setItem("history", JSON.stringify([]));

  showDashboard();
}

/* DASHBOARD */
function showDashboard() {
  hideAll();
  dashboard.style.display = "block";

  const tests = Number(localStorage.getItem("testsGiven"));
  const unlocked = localStorage.getItem("unlocked");

  welcome.innerText = "Welcome to PrepOne";

  if (tests === 0) {
    unlockMsg.innerText = "First test is FREE (Ads supported)";
  } else if (!unlocked) {
    unlockMsg.innerHTML =
      `Unlock full REET series for ₹${PRICE}. <br>
      <button onclick="pay()">Pay ₹${PRICE}</button>`;
  } else {
    unlockMsg.innerText = "All tests unlocked";
  }
}

function pay() {
  window.open(PAYMENT_LINK, "_blank");
  alert("After payment, click OK to unlock.");
  localStorage.setItem("unlocked", "yes");
  showDashboard();
}

/* QUIZ */
function startTest() {
  const tests = Number(localStorage.getItem("testsGiven"));
  const unlocked = localStorage.getItem("unlocked");

  if (tests > 0 && !unlocked) {
    alert("Please unlock full course");
    return;
  }

  answers = [];
  index = 0;
  timeLeft = 2400;

  hideAll();
  quiz.style.display = "block";
  startTimer();
  render();
}

function render() {
  qCounter.innerText = `Q ${index+1}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((o,i)=>{
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = ()=>{ answers[index]=i; };
    options.appendChild(b);
  });
}

/* TIMER */
function startTimer() {
  updateTime();
  timer = setInterval(()=>{
    timeLeft--;
    updateTime();
    if (timeLeft<=0) finishQuiz();
  },1000);
}

function updateTime() {
  time.innerText = Math.floor(timeLeft/60)+":"+String(timeLeft%60).padStart(2,"0");
}

/* FINISH */
function finishQuiz() {
  clearInterval(timer);

  let correct=0, wrong=0;
  answers.forEach((a,i)=>{
    if (a===questions[i].a) correct++;
    else if (a!=null) wrong++;
  });

  let score = +(correct - wrong/3).toFixed(2);
  let percent = Math.round(score / questions.length * 100);

  let history = JSON.parse(localStorage.getItem("history"));
  history.push({ date:new Date(), score, percent });
  localStorage.setItem("history", JSON.stringify(history));

  localStorage.setItem("testsGiven", Number(localStorage.getItem("testsGiven"))+1);

  showResult(percent);
}

/* RESULT */
function showResult(percent) {
  hideAll();
  result.style.display = "block";

  const lang = localStorage.getItem("lang");

  resultTitle.innerText =
    lang==="hi" ? "परीक्षा परिणाम" : "Test Result";

  finalScore.innerText = `Score: ${percent}%`;

  motivation.innerText =
    percent>=80 ? (lang==="hi"?"शानदार!":"Excellent work!") :
    percent>=50 ? (lang==="hi"?"अच्छा प्रयास":"Good effort!") :
    (lang==="hi"?"और अभ्यास करें":"Keep practicing!");
}

function showHistory() {
  hideAll();
  history.style.display = "block";
  historyList.innerHTML = "";

  JSON.parse(localStorage.getItem("history")).forEach(h=>{
    historyList.innerHTML += `<p>${new Date(h.date).toLocaleString()} - ${h.percent}%</p>`;
  });
}

function backDashboard() {
  showDashboard();
}

/* UTILS */
function hideAll() {
  ["login","dashboard","quiz","result","history"]
    .forEach(id=>document.getElementById(id).style.display="none");
}

if (localStorage.getItem("user")) showDashboard();


