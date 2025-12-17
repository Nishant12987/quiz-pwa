const questions = [
  { q: "Sample Question 1", options:["A","B","C","D"], a:0 }
];

let answers = [];
let index = 0;
let timeLeft = 2400;
let timer;
let violations = 0;

/* ---------- LOGIN ---------- */
function login() {
  const email = emailInput();
  const lang = document.getElementById("language").value;
  if (!email) return alert("Enter email");

  localStorage.setItem("user", email);
  localStorage.setItem("lang", lang);

  if (!localStorage.getItem("history"))
    localStorage.setItem("history", JSON.stringify([]));

  showDashboard();
}

/* ---------- DASHBOARD ---------- */
function showDashboard() {
  hideAll();
  show("dashboard");

  welcome.innerText = "Welcome " + localStorage.getItem("user");
  limit.innerText = "1 Free Test Available";
}

/* ---------- LOCKED ---------- */
function locked() {
  alert("Please unlock full course to continue.\n₹149 only");
}

/* ---------- QUIZ ---------- */
function startTest(id) {
  answers = Array(questions.length).fill(null);
  index = 0;
  violations = 0;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

/* ---------- RENDER ---------- */
function render() {
  qCounter.innerText = `Question ${index+1}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((o,i)=>{
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = ()=>{ answers[index]=i; };
    options.appendChild(b);
  });
}

/* ---------- TIMER ---------- */
function startTimer() {
  timer = setInterval(()=>{
    timeLeft--;
    time.innerText = `${Math.floor(timeLeft/60)}:${timeLeft%60}`;
    if(timeLeft<=0) finishQuiz();
  },1000);
}

/* ---------- SECURITY ---------- */
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden){
    violations++;
    alert("Warning: Do not switch apps during test.");
    if(violations>=3){
      alert("Test auto-submitted due to violations.");
      finishQuiz();
    }
  }
});

/* ---------- FINISH ---------- */
function finishQuiz() {
  clearInterval(timer);

  let correct=0, wrong=0;
  answers.forEach((a,i)=>{
    if(a===null) return;
    if(a===questions[i].a) correct++;
    else wrong++;
  });

  let score = +(correct - wrong/3).toFixed(2);
  let percent = +(score/questions.length*100).toFixed(1);

  saveHistory(score, percent);
  showResult(score, percent);
}

/* ---------- RESULT ---------- */
function showResult(score, percent){
  hideAll();
  show("result");

  const lang = localStorage.getItem("lang");

  resultTitle.innerText = lang==="hi" ? "परिणाम" : "Result";
  finalScore.innerText = `${score} marks (${percent}%)`;

  motivation.innerText = getMotivation(percent, lang);
}

/* ---------- HISTORY ---------- */
function saveHistory(score, percent){
  let h = JSON.parse(localStorage.getItem("history"));
  h.push({date:new Date(),score,percent});
  localStorage.setItem("history", JSON.stringify(h));
}

function showHistory(){
  hideAll();
  show("history");
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  JSON.parse(localStorage.getItem("history")).forEach(h=>{
    list.innerHTML += `<p>${new Date(h.date).toLocaleString()} - ${h.score}</p>`;
  });
}

/* ---------- UTIL ---------- */
function hideAll(){
  ["login","dashboard","quiz","result","history"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
}
function show(id){ document.getElementById(id).style.display="block"; }
function emailInput(){ return document.getElementById("email").value; }

function getMotivation(p, lang){
  if(lang==="hi"){
    if(p>=80) return "बहुत बढ़िया! आप सही दिशा में हैं।";
    if(p>=50) return "अच्छा प्रयास, और अभ्यास करें।";
    return "मेहनत जारी रखें, सफलता मिलेगी।";
  } else {
    if(p>=80) return "Excellent! You're exam ready.";
    if(p>=50) return "Good effort. Keep practicing.";
    return "Don't give up. Improvement is coming.";
  }
}

