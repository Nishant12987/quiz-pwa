const TEST_MODE = true; // ← set false before final launch
let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;
let currentMeta = {};

function login(){
  if(!agree.checked) return alert("Please accept policies");
  const email = emailInput();
  if(!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if(!localStorage.getItem("usage"))
    localStorage.setItem("usage", JSON.stringify({ tests: 0, paid: false }));

  showDashboard();
}

function showDashboard(){
  hideAll(); show("dashboard");
  welcome.innerText = "Welcome " + localStorage.getItem("user");
  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };

  const u = JSON.parse(localStorage.getItem("usage"));
  limit.innerText = u.paid ? "Unlimited access" : "1 free mock available";
}

function startFlow(){
  const u = JSON.parse(localStorage.getItem("usage"));
  if(!level.value || !language.value) return alert("Select all options");
  if(level.value === "level2" && !stream.value) return alert("Select stream");

  if (!u.paid && u.tests >= 1 && !TEST_MODE) {
  alert("Free test over. Pay ₹149 to unlock all tests.");
  window.open("https://razorpay.me/@prepone", "_blank");
  return;
  }

  loadNextMock();
}

function loadNextMock(){
  const lvl = level.value;
  const lang = language.value;
  const str = lvl === "level2" ? stream.value : "";

  const key = `progress_${lvl}_${str}_${lang}`;
  const lastMock = parseInt(localStorage.getItem(key) || "0");
  const nextMock = lastMock + 1;

  const path =
    lvl === "level1"
      ? `/papers/level1/${lang}/mock${nextMock}.json`
      : `/papers/level2/${str}/${lang}/mock${nextMock}.json`;

  fetch(path)
    .then(r => {
      if(!r.ok) throw new Error("No more mocks available");
      return r.json();
    })
    .then(data => {
      questions = data;
      answers = Array(40).fill(null);
      index = 0;
      timeLeft = 2400;

      currentMeta = { key, nextMock };
      hideAll(); show("quiz");
      startTimer();
      render();
    })
    .catch(() => {
      alert("All available mocks completed.");
    });
}

function render(){
  qCounter.innerText = `Q ${index+1}/40`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((o,i)=>{
    const b = document.createElement("button");
    b.innerText = o;
    if(answers[index] === i) b.style.background = "#bbf7d0";
    b.onclick = ()=>{ answers[index] = i; render(); };
    options.appendChild(b);
  });
}

function nextQ(){ if(index < 39){ index++; render(); } }
function prevQ(){ if(index > 0){ index--; render(); } }

function finishQuiz(){
  clearInterval(timer);

  let c=0,w=0;
  answers.forEach((a,i)=>{
    if(a === questions[i].a) c++;
    else if(a !== null) w++;
  });

  const score = (c - w/3).toFixed(2);

  const u = JSON.parse(localStorage.getItem("usage"));
  u.tests++;
  localStorage.setItem("usage", JSON.stringify(u));

  localStorage.setItem(currentMeta.key, currentMeta.nextMock);

  hideAll(); show("result");
  resultTitle.innerText = language.value === "hindi" ? "परिणाम" : "Result";
  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText = motivation(score);
}

function motivation(score){
  score = parseFloat(score);
  if(language.value === "hindi"){
    if(score >= 30) return "बहुत बढ़िया! आप सही दिशा में हैं।";
    if(score >= 20) return "अच्छा प्रयास, अभ्यास जारी रखें।";
    return "घबराएं नहीं, निरंतर अभ्यास से सफलता मिलेगी।";
  }else{
    if(score >= 30) return "Excellent! You are exam ready.";
    if(score >= 20) return "Good attempt. Keep practicing.";
    return "Don’t give up. Improvement is coming.";
  }
}

function showHistory(){
  hideAll(); show("history");
  historyList.innerHTML = "Sequential progress is tracked automatically per series.";
}

function startTimer(){
  updateTime();
  timer = setInterval(()=>{
    timeLeft--;
    updateTime();
    if(timeLeft <= 0) finishQuiz();
  },1000);
}

function updateTime(){
  time.innerText =
    Math.floor(timeLeft/60) + ":" + String(timeLeft%60).padStart(2,"0");
}

function hideAll(){
  ["login","dashboard","quiz","result","history"].forEach(
    id => document.getElementById(id).style.display="none"
  );
}
function show(id){ document.getElementById(id).style.display="block"; }
function emailInput(){ return document.getElementById("email").value; }

if(localStorage.getItem("user")) showDashboard();




