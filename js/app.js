/* ---------------- DATA ---------------- */
const papers = {
  reet: Array.from({ length: 40 }, (_, i) => ({
    q: `REET Practice Question ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    a: Math.floor(Math.random() * 4)
  }))
};


let questions=[], answers=[], index=0, timer, timeLeft=2400;

/* ---------------- LOGIN ---------------- */
function login(){
  const e=email.value;
  if(!e) return alert("Enter email");
  localStorage.setItem("user",e);
  if(!localStorage.getItem("daily"))
    localStorage.setItem("daily",JSON.stringify({date:today(),used:0,scores:[]}));
  showDashboard();
}

function logout(){localStorage.clear();location.reload();}
function showInstructions() {
  hideAll();
  document.getElementById("instructions").style.display = "block";
}


/* ---------------- DASHBOARD ---------------- */
function showDashboard(){
  hideAll();dashboard.style.display="block";
  welcome.innerText="Hello "+localStorage.getItem("user");

  let d=JSON.parse(localStorage.getItem("daily"));
  if(d.date!==today()){
    localStorage.setItem("lastDayScore",avg(d.scores));
    d={date:today(),used:0,scores:[]};
    localStorage.setItem("daily",JSON.stringify(d));
  }

  const premium=localStorage.getItem("premium")==="true";
  adBox.style.display=premium?"none":"block";
  limit.innerText=premium?"Unlimited Tests":"Tests left: "+(2-d.used);

  const y=localStorage.getItem("lastDayScore")||0;
  const t=avg(d.scores);
  progress.innerText=`Yesterday ${y}% | Today ${t}%`;
  rating.innerText=getRating(t);
  breakMsg.innerText=d.used===1?"Take 2–3 hour break":"";
}

/* ---------------- QUIZ ---------------- */
function startQuiz(){
  let d=JSON.parse(localStorage.getItem("daily"));
  if(localStorage.getItem("premium")!=="true" && d.used>=2)
    return alert("Daily limit reached");

  questions=papers[topic.value];
  answers=Array(40).fill(null);
  index=0;timeLeft=2400;
  hideAll();quiz.style.display="block";
  startTimer();render();
}

function render(){
  qCounter.innerText=`Q ${index+1}/40`;
  question.innerText=questions[index].q;
  options.innerHTML="";
  progressBar.style.width=((index+1)/40*100)+"%";

  questions[index].options.forEach((o,i)=>{
    const b=document.createElement("button");
    b.innerText=o;
    if(answers[index]===i) b.style.background="#0a5cff",b.style.color="white";
    b.onclick=()=>{answers[index]=i;render();}
    options.appendChild(b);
  });
}

function nextQ(){if(index<39){index++;render();}}
function prevQ(){if(index>0){index--;render();}}

function finishQuiz(){
  clearInterval(timer);
  let score=0;
  answers.forEach((a,i)=>{if(a===questions[i].a)score++;});
  const pct=Math.round(score/40*100);

  let d=JSON.parse(localStorage.getItem("daily"));
  d.used++;d.scores.push(pct);
  localStorage.setItem("daily",JSON.stringify(d));
  showResult(score,pct);
}

/* ---------------- TIMER ---------------- */
function startTimer(){
  updateTime();
  timer=setInterval(()=>{
    timeLeft--;
    updateTime();
    if(timeLeft<=0){finishQuiz();}
  },1000);
}

function updateTime(){
  time.innerText=
    Math.floor(timeLeft/60)+":"+(timeLeft%60).toString().padStart(2,"0");
}

/* ---------------- RESULT ---------------- */
function showResult(score,pct){
  hideAll();result.style.display="block";
  finalScore.innerText=`Score: ${score}/40 (${pct}%)`;
  review.innerHTML="";
  questions.forEach((q,i)=>{
    review.innerHTML+=`
    <div>
      <b>Q${i+1}</b> ${q.q}<br>
      Your: ${q.options[answers[i]]||"Skipped"}<br>
      Correct: ${q.options[q.a]}
    </div><hr>`;
  });
}

/* ---------------- UTIL ---------------- */
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
}
function togglePremium(){localStorage.setItem("premium",premiumToggle.checked);}
function hideAll(){["login","dashboard","quiz","result"].forEach(id=>document.getElementById(id).style.display="none");}
function today(){return new Date().toDateString();}
function avg(a){return a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;}
function getRating(p){return p>=80?"Excellent":p>=60?"Good":p>=40?"Improving":"Beginner";}

/* ---------------- INIT ---------------- */
if(localStorage.getItem("dark")==="true") document.body.classList.add("dark");
if(localStorage.getItem("premium")==="true") premiumToggle.checked=true;
if(localStorage.getItem("user")) showDashboard();
