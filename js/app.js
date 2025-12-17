let questions = [];
let answers = [];
let index = 0;
let timeLeft = 2400;
let timer;

/* ---------- LOGIN ---------- */
function login() {
  localStorage.setItem("email", email.value);
  localStorage.setItem("lang", language.value);
  hideAll(); show("category");
}

/* ---------- CATEGORY ---------- */
function toggleStream() {
  stream.style.display = level.value === "level2" ? "block" : "none";
}

function saveCategory() {
  localStorage.setItem("level", level.value);
  localStorage.setItem("stream", stream.value);
  if (!localStorage.getItem("attempts")) localStorage.setItem("attempts", 0);
  showDashboard();
}

/* ---------- DASHBOARD ---------- */
function showDashboard() {
  hideAll(); show("dashboard");
  welcome.innerText = "Welcome";
  info.innerText = "1 Free Test | ₹149 for 40 Full Tests";
}

/* ---------- TEST PREP ---------- */
function prepareTest() {
  let attempts = +localStorage.getItem("attempts");
  if (attempts === 0) {
    hideAll(); show("adScreen");
  } else {
    hideAll(); show("result");
    paymentMsg.innerText = "Please unlock full access to continue.";
  }
}

/* ---------- START TEST ---------- */
function startTest() {
  document.documentElement.requestFullscreen();
  document.addEventListener("visibilitychange", warnSwitch);

  fetchQuestions().then(qs => {
    questions = qs;
    answers = Array(40).fill(null);
    index = 0;
    timeLeft = 2400;
    hideAll(); show("quiz");
    startTimer();
    render();
  });
}

/* ---------- FETCH QUESTIONS ---------- */
async function fetchQuestions() {
  const level = localStorage.getItem("level");
  const stream = localStorage.getItem("stream");
  const lang = localStorage.getItem("lang");
  const path =
    level === "level1"
      ? `papers/level1/${lang}/mock1.json`
      : `papers/level2/${stream}/${lang}/mock1.json`;

  const res = await fetch(path);
  return await res.json();
}

/* ---------- QUIZ ---------- */
function render() {
  qCounter.innerText = `Q ${index + 1}/40`;
  question.innerText = questions[index].q;
  options.innerHTML = "";
  questions[index].options.forEach((o, i) => {
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = () => { answers[index] = i; };
    options.appendChild(b);
  });
}

function nextQ(){ if(index<39){index++;render();}}
function prevQ(){ if(index>0){index--;render();}}

/* ---------- FINISH ---------- */
function finishQuiz() {
  clearInterval(timer);
  document.exitFullscreen();
  document.removeEventListener("visibilitychange", warnSwitch);

  let correct=0, wrong=0;
  answers.forEach((a,i)=>{
    if(a===null)return;
    a===questions[i].a ? correct++ : wrong++;
  });

  let score = +(correct - wrong/3).toFixed(2);
  let lang = localStorage.getItem("lang");

  hideAll(); show("result");
  scoreText.innerText = `Score: ${score}/40`;
  motivation.innerText = lang==="hindi"
    ? score>=20 ? "बहुत बढ़िया प्रयास!" : "अभ्यास जारी रखें"
    : score>=20 ? "Good effort! Keep improving." : "Keep practicing!";

  let attempts = +localStorage.getItem("attempts");
  localStorage.setItem("attempts", attempts+1);
}

/* ---------- TIMER ---------- */
function startTimer(){
  timer=setInterval(()=>{
    timeLeft--;
    time.innerText=`${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,"0")}`;
    if(timeLeft<=0) finishQuiz();
  },1000);
}

/* ---------- SECURITY (BEST POSSIBLE) ---------- */
function warnSwitch(){
  alert("Please stay on the test screen for best experience.");
}

/* ---------- UTILS ---------- */
function hideAll(){
  ["login","category","dashboard","quiz","result","adScreen"]
    .forEach(id=>document.getElementById(id).style.display="none");
}
function show(id){document.getElementById(id).style.display="block";}


