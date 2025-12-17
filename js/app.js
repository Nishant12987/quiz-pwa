let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400;

/* ---------------- LOGIN ---------------- */
function login(){
  if(!agree.checked) return alert("Accept policies");
  const email = emailInput();
  if(!email) return alert("Enter email");

  localStorage.setItem("user", email);

  if(!localStorage.getItem("usage")){
    localStorage.setItem("usage", JSON.stringify({
      testsDone: 0,
      paid: false
    }));
  }

  showDashboard();
}

/* ---------------- DASHBOARD ---------------- */
function showDashboard(){
  hideAll();
  show("dashboard");

  welcome.innerText = "Welcome " + localStorage.getItem("user");

  const saved = JSON.parse(localStorage.getItem("selection"));
  if(saved){
    document.getElementById("selectionBox").style.display = "none";
  }

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };

  const u = JSON.parse(localStorage.getItem("usage"));
  limit.innerText = u.paid
    ? "Unlimited access unlocked"
    : "1 free mock available";
}

/* ---------------- FLOW ---------------- */
function startFlow(){
  let selection = JSON.parse(localStorage.getItem("selection"));

  if(!selection){
    if(!level.value || !language.value) return alert("Select all options");
    if(level.value==="level2" && !stream.value) return alert("Select stream");

    selection = {
      level: level.value,
      stream: stream.value || "",
      language: language.value
    };
    localStorage.setItem("selection", JSON.stringify(selection));
  }

  const u = JSON.parse(localStorage.getItem("usage"));
  if(!u.paid && u.testsDone >= 1){
    alert("Free test over. Please purchase full access.");
    window.open("https://razorpay.me/@prepone", "_blank");
    return;
  }

  loadMock();
}

/* ---------------- LOAD MOCK ---------------- */
async function loadMock(){
  const u = JSON.parse(localStorage.getItem("usage"));
  const mockNo = u.testsDone + 1;

  const sel = JSON.parse(localStorage.getItem("selection"));

  const base = `data/${sel.level}/${sel.language}/${
    sel.level === "level2" ? sel.stream + "/" : ""
  }mock${mockNo}.json`;

  try{
    const res = await fetch(base);
    questions = await res.json();
  }catch{
    alert("All available mocks completed");
    return;
  }

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

/* ---------------- RENDER ---------------- */
function render(){
  qCounter.innerText = `Q ${index+1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt,i)=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = opt;
    btn.style.pointerEvents = "auto";

    if(answers[index] === i){
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      answers[index] = i;
      render();
    };

    options.appendChild(btn);
  });
}

function nextQ(){ if(index < questions.length-1){ index++; render(); } }
function prevQ(){ if(index > 0){ index--; render(); } }

/* ---------------- FINISH ---------------- */
function finishQuiz(){
  clearInterval(timer);

  let correct = 0, wrong = 0;
  answers.forEach((a,i)=>{
    if(a === questions[i].a) correct++;
    else if(a !== null) wrong++;
  });

  let score = (correct - wrong/3).toFixed(2);

  const u = JSON.parse(localStorage.getItem("usage"));
  u.testsDone++;
  localStorage.setItem("usage", JSON.stringify(u));

  hideAll();
  show("result");

  const sel = JSON.parse(localStorage.getItem("selection"));
  resultTitle.innerText = sel.language==="hindi" ? "परिणाम" : "Result";
  finalScore.innerText = `Score: ${score}/40`;
  finalMsg.innerText = motivation(score, sel.language);
}

/* ---------------- TIMER ---------------- */
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
    Math.floor(timeLeft/60) + ":" +
    String(timeLeft%60).padStart(2,"0");
}

/* ---------------- HELPERS ---------------- */
function motivation(score, lang){
  score = Number(score);
  if(lang==="hindi"){
    if(score>=30) return "बहुत बढ़िया! आप सही दिशा में हैं।";
    if(score>=20) return "अच्छा प्रयास, अभ्यास जारी रखें।";
    return "मेहनत जारी रखें, सफलता मिलेगी।";
  }else{
    if(score>=30) return "Excellent! You are exam ready.";
    if(score>=20) return "Good effort. Keep practicing.";
    return "Don’t give up. Improvement will come.";
  }
}

function hideAll(){
  ["login","dashboard","quiz","result"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
}
function show(id){ document.getElementById(id).style.display="block"; }
function emailInput(){ return document.getElementById("email").value; }

if(localStorage.getItem("user")) showDashboard();
