let questions = [];
let answers = [];
let index = 0;
let timer;
let timeLeft = 2400; // 40 minutes
let fiveMinWarned = false;

/* ================= LOGIN ================= */
function login() {
  if (!agree.checked) return alert("Accept policies");

  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Enter email");

  localStorage.setItem("user_email", email);

  if (!localStorage.getItem("user_access")) {
    localStorage.setItem(
      "user_access",
      JSON.stringify({
        level: "",
        stream: "",
        language: "",
        paid: false,
        testsDone: 0,
        unlockCode: "",
        paymentInitiatedAt: null
      })
    );
  }

  showDashboard();
}

/* ================= DASHBOARD ================= */
function showDashboard() {
  hideAll();
  show("dashboard");

  const email = localStorage.getItem("user_email");
  const access = JSON.parse(localStorage.getItem("user_access"));

  welcome.innerText = "Welcome " + email;

  if (access.level) {
    document.getElementById("selectionBox").style.display = "none";
    limit.innerText = access.paid
      ? "Paid access active"
      : "1 free mock remaining";
  } else {
    document.getElementById("selectionBox").style.display = "block";
    limit.innerText = "Choose your exam (one-time selection)";
  }

  level.onchange = () => {
    stream.style.display = level.value === "level2" ? "block" : "none";
  };

  /* ==== SHOW / HIDE ENTER CODE BUTTON AFTER 30 MIN ==== */
  const enterBtn = document.getElementById("enterCodeBtn");

  if (
    access.paymentInitiatedAt &&
    !access.paid &&
    Date.now() - access.paymentInitiatedAt >= 30 * 60 * 1000
  ) {
    enterBtn.style.display = "block";
  } else {
    enterBtn.style.display = "none";
  }
}

/* ================= ENTER UNLOCK CODE ================= */
function enterUnlockCode() {
  const access = JSON.parse(localStorage.getItem("user_access"));

  if (access.paid) {
    return alert(
      access.language === "hindi"
        ? "आपका अकाउंट पहले से अनलॉक है।"
        : "Your account is already unlocked."
    );
  }

  if (!access.unlockCode) {
    return alert(
      access.language === "hindi"
        ? "पहले खरीद प्रक्रिया शुरू करें, फिर अनलॉक कोड डालें।"
        : "Please initiate purchase first to get an unlock code."
    );
  }

  const entered = prompt(
    access.language === "hindi"
      ? "भुगतान के बाद मिला अनलॉक कोड डालें:"
      : "Enter the unlock code you received after payment:"
  );

  if (!entered) return;

  if (entered.trim() === access.unlockCode) {
    access.paid = true;
    access.unlockCode = "USED";

    localStorage.setItem("user_access", JSON.stringify(access));

    alert(
      access.language === "hindi"
        ? "✅ भुगतान सत्यापित। आपका एक्सेस अनलॉक कर दिया गया है।"
        : "✅ Payment verified. Full access unlocked."
    );

    showDashboard();
  } else {
    alert(
      access.language === "hindi"
        ? "❌ गलत या पहले से उपयोग किया गया अनलॉक कोड।"
        : "❌ Invalid or already used unlock code."
    );
  }
}

/* ================= UNLOCK CODE GENERATOR ================= */
function generateUnlockCode() {
  return (
    "PREPONE-" +
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    "-" +
    Date.now().toString().slice(-4)
  );
}

/* ================= PURCHASE PROMPT ================= */
function showPurchasePrompt(access) {
  const code = generateUnlockCode();
  access.unlockCode = code;
  access.paymentInitiatedAt = Date.now(); // ⏱️ start 30 min timer

  localStorage.setItem("user_access", JSON.stringify(access));

  let msg =
    access.language === "hindi"
      ? "पूरा टेस्ट पैक खरीदें:\n\n• ₹149 में 20 मॉक टेस्ट\n\nभुगतान के बाद आपके टेस्ट 2 घंटे के अंदर अनलॉक कर दिए जाएंगे।\n\nआपका अनलॉक कोड:\n" +
        code +
        "\n\nभुगतान के बाद यह कोड ईमेल करें:\nprepone.exam@gmail.com"
      : "Purchase the test pack:\n\n• ₹149 for 20 mock tests\n\nYour tests will be unlocked within 2 hours.\n\nYour unlock code:\n" +
        code +
        "\n\nAfter payment, email this code to:\nprepone.exam@gmail.com";

  alert(msg);
  window.open("https://rzp.io/rzp/RVonbpx", "_blank");
}

/* ================= START FLOW ================= */
function startFlow() {
  let access = JSON.parse(localStorage.getItem("user_access"));

  if (!access.level) {
    if (!level.value || !language.value)
      return alert("Select all options");

    if (level.value === "level2" && !stream.value)
      return alert("Select stream");

    access.level = level.value;
    access.stream = level.value === "level2" ? stream.value : "";
    access.language = language.value;
    localStorage.setItem("user_access", JSON.stringify(access));
  }

  if (!access.paid && access.testsDone >= 1) {
    showPurchasePrompt(access);
    return;
  }

  loadMock();
}

/* ================= LOAD MOCK ================= */
async function loadMock() {
  const access = JSON.parse(localStorage.getItem("user_access"));
  const mockNo = access.testsDone + 1;

  let baseFolder =
    access.level === "level1"
      ? "level1"
      : access.stream === "social"
      ? "level2-social"
      : "level2-socio";

  const path = `data/${baseFolder}/${access.language}/mock${mockNo}.json`;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    questions = await res.json();
  } catch {
    alert("No more mocks available.");
    showDashboard();
    return;
  }

  answers = Array(questions.length).fill(null);
  index = 0;
  timeLeft = 2400;
  fiveMinWarned = false;

  hideAll();
  show("quiz");
  startTimer();
  render();
}

/* ================= RENDER ================= */
function render() {
  qCounter.innerText = `Q ${index + 1}/${questions.length}`;
  question.innerText = questions[index].q;
  options.innerHTML = "";

  questions[index].options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    if (answers[index] === i) btn.classList.add("selected");
    btn.onclick = () => {
      answers[index] = i;
      render();
    };
    options.appendChild(btn);
  });
}

/* ================= FINISH ================= */
function finishQuiz() {
  clearInterval(timer);
  let correct = 0,
    wrong = 0;

  answers.forEach((a, i) => {
    if (a === questions[i].a) correct++;
    else if (a !== null) wrong++;
  });

  let score = (correct - wrong / 3).toFixed(2);

  let access = JSON.parse(localStorage.getItem("user_access"));
  access.testsDone++;
  localStorage.setItem("user_access", JSON.stringify(access));

  hideAll();
  show("result");
  finalScore.innerText = `Score: ${score}/40`;
}

/* ================= TIMER ================= */
function startTimer() {
  updateTime();
  timer = setInterval(() => {
    timeLeft--;
    updateTime();

    if (timeLeft === 300 && !fiveMinWarned) {
      fiveMinWarned = true;
      alert("⚠️ Only 5 minutes left.");
    }

    if (timeLeft <= 0) finishQuiz();
  }, 1000);
}

function updateTime() {
  time.innerText =
    Math.floor(timeLeft / 60) +
    ":" +
    String(timeLeft % 60).padStart(2, "0");
}

/* ================= HELPERS ================= */
function hideAll() {
  ["login", "dashboard", "quiz", "result"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
}

function show(id) {
  document.getElementById(id).style.display = "block";
}

/* ================= AUTO LOGIN ================= */
if (localStorage.getItem("user_email")) {
  showDashboard();
}
