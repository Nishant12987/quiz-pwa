let questions=[], answers=[], index=0, timeLeft=2400, timer;

function login(){
  if(!agree.checked) return alert("Accept policies");
  const email = emailInput();
  if(!email) return alert("Enter email");
  localStorage.setItem("user", email);

  if(!localStorage.getItem("usage")){
    localStorage.setItem("usage", JSON.stringify({
      paid:false,
      attempts:{}
    }));
  }
  showDashboard();
}

function showDashboard(){
  hideAll(); show("dashboard");
  welcome.innerText = "Welcome " + localStorage.getItem("user");

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };

  const u = JSON.parse(localStorage.getItem("usage"));
  limit.innerText = u.paid ? "Unlimited access" : "1 Free mock available";
}

async function startFlow(){
  const u = JSON.parse(localStorage.getItem("usage"));
  if(!level.value || !language.value) return alert("Select all options");
  if(level.value==="level2" && !stream.value) return alert("Select stream");

  const key = getKey();
  const attempt = u.attempts[key] || 0;

  if(!u.paid && attempt>=1){
    alert("Free mock over. Please unlock full access.");
    window.open("https://razorpay.me/@prepone","_blank");
    return;
  }

  await loadTest(attempt+1);
}

async function loadTest(mockNo){
  const path = buildPath(mockNo);
  try{
    const res = await fetch(path);
    questions = await res.json();
  }catch{
    alert("All available mocks completed.");
    return;
  }

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;

  hideAll(); show("quiz");
  startTimer();
  render();
}

function buildPath(mockNo){
  let base = "data/";
  if(level.value==="level1"){
    base += `level1/${language.value}/mock${mockNo}.json`;
  }else{
    const folder = stream.value==="socio" ? "level2-socio" : "level2-social";
    base += `${folder}/${language.value}/mock${mockNo}.json`;
  }
  return base;
}

function getKey(){
  return `${level.value}_${stream.value||"na"}_${language.value}`;
}

function render(){
  qCounter.innerText = `Q ${index+1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((o,i)=>{
    const b = document.createElement("button");
    b.innerText = o;
    if(answers[index]===i) b.classList.add("selected");
    b.onclick = ()=>{answers[index]=i; render();};
    options.appendChild(b);
  });
}

function prevQ(){ if(index>0){ index--; render(); } }
function nextQ(){ if(index<questions.length-1){ index++; render(); } }

function finishQuiz(){
  clearInterval(timer);
  let c=0,w=0;
  answers.forEach((a,i)=>{
    if(a===questions[i].a) c++;
    else if(a!==null) w++;
  });
  const score = (c - w/3).toFixed(2);

  const u = JSON.parse(localStorage.getItem("usage"));
  const key = getKey();
  u.attempts[key] = (u.attempts[key]||0)+1;
  localStorage.setItem("usage", JSON.stringify(u));

  hideAll(); show("result");
  resultTitle.innerText = language.value==="hindi" ? "परिणाम" : "Result";
  finalScore.innerText = `Score: ${score}`;
  finalMsg.innerText = motivation(score);
}

function motivation(score){
  score = parseFloat(score);
  if(language.value==="hindi"){
    if(score>=30) return "बहुत बढ़िया! आप सही दिशा में हैं।";
    if(score>=20) return "अच्छा प्रयास, अभ्यास जारी रखें।";
    return "घबराएं नहीं, मेहनत से सफलता मिलेगी।";
  }else{
    if(score>=30) return "Excellent! You are exam ready.";
    if(score>=20) return "Good attempt. Keep practicing.";
    return "Do not give up. Improvement is coming.";
  }
}

function showHistory(){
  hideAll(); show("history");
  const u = JSON.parse(localStorage.getItem("usage"));
  historyList.innerHTML = "";
  Object.entries(u.attempts).forEach(([k,v])=>{
    const p = document.createElement("p");
    p.innerText = `${k.replaceAll("_"," ")} → ${v} mock(s)`;
    historyList.appendChild(p);
  });
}

function startTimer(){
  updateTime();
  timer = setInterval(()=>{
    timeLeft--; updateTime();
    if(timeLeft<=0) finishQuiz();
  },1000);
}
function updateTime(){
  time.innerText = Math.floor(timeLeft/60)+":"+String(timeLeft%60).padStart(2,"0");
}

function hideAll(){
  ["login","dashboard","quiz","result","history"]
    .forEach(id=>document.getElementById(id).style.display="none");
}
function show(id){ document.getElementById(id).style.display="block"; }
function emailInput(){ return document.getElementById("email").value; }

if(localStorage.getItem("user")) showDashboard();
