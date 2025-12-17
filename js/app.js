let questions=[],answers=[],index=0,timeLeft=2400,timer;

function login(){
  if(!agree.checked) return alert("Please accept policies");
  const email=emailInput();
  if(!email) return alert("Enter email");
  localStorage.setItem("user",email);

  if(!localStorage.getItem("usage"))
    localStorage.setItem("usage",JSON.stringify({tests:0,paid:false}));

  showDashboard();
}

function showDashboard(){
  hideAll(); show("dashboard");
  welcome.innerText="Welcome "+localStorage.getItem("user");
  level.onchange=()=>stream.style.display=level.value==="level2"?"block":"none";

  const u=JSON.parse(localStorage.getItem("usage"));
  limit.innerText=u.paid?"Unlimited access":"1 Free test available";
}

function startFlow(){
  const u=JSON.parse(localStorage.getItem("usage"));
  if(!level.value||!language.value) return alert("Select all options");
  if(level.value==="level2"&&!stream.value) return alert("Select stream");

  if(!u.paid && u.tests>=1){
    alert("Free test over. Pay ₹149 to unlock all tests.");
    window.open("https://razorpay.me/@prepone","_blank");
    return;
  }
  loadTest();
}

function loadTest(){
  questions=Array.from({length:40},(_,i)=>({
    q:`Sample Question ${i+1}`,
    options:["A","B","C","D"],
    a:Math.floor(Math.random()*4)
  }));
  answers=Array(40).fill(null);
  index=0; timeLeft=2400;

  hideAll(); show("quiz");
  startTimer(); render();
}

function render(){
  qCounter.innerText=`Q ${index+1}/40`;
  question.innerText=questions[index].q;
  options.innerHTML="";
  questions[index].options.forEach((o,i)=>{
    const b=document.createElement("button");
    b.innerText=o;
    if(answers[index]===i) b.style.background="#bbf7d0";
    b.onclick=()=>{answers[index]=i;render();}
    options.appendChild(b);
  });
}

function finishQuiz(){
  clearInterval(timer);
  let c=0,w=0;
  answers.forEach((a,i)=>{
    if(a===questions[i].a)c++;
    else if(a!==null)w++;
  });
  let score=(c-w/3).toFixed(2);
  const u=JSON.parse(localStorage.getItem("usage"));
  u.tests++; localStorage.setItem("usage",JSON.stringify(u));

  hideAll(); show("result");
  resultTitle.innerText=language.value==="hindi"?"परिणाम":"Result";
  finalScore.innerText=`Score: ${score}/40`;
  finalMsg.innerText=motivation(score);
}

function motivation(score){
  score=parseFloat(score);
  if(language.value==="hindi"){
    if(score>30)return"बहुत बढ़िया! आप सही दिशा में हैं।";
    if(score>20)return"अच्छा प्रयास, अभ्यास जारी रखें।";
    return"घबराएं नहीं, मेहनत से सफलता मिलेगी।";
  }else{
    if(score>30)return"Excellent! You are exam ready.";
    if(score>20)return"Good attempt. Keep practicing.";
    return"Don’t give up. Improvement is coming.";
  }
}

function showHistory(){
  hideAll(); show("history");
  historyList.innerHTML="Feature unlocked after payment.";
}

function startTimer(){
  updateTime();
  timer=setInterval(()=>{
    timeLeft--; updateTime();
    if(timeLeft<=0) finishQuiz();
  },1000);
}
function updateTime(){
  time.innerText=Math.floor(timeLeft/60)+":"+String(timeLeft%60).padStart(2,"0");
}

function hideAll(){
  ["login","dashboard","quiz","result","history"].forEach(id=>document.getElementById(id).style.display="none");
}
function show(id){document.getElementById(id).style.display="block";}
function emailInput(){return document.getElementById("email").value;}

if(localStorage.getItem("user")) showDashboard();



