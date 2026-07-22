// นำ Config จาก Firebase ของคุณมาใส่ตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyArjT5xq3VIZfdQFaiWIggCJnBqCz6I3wk",
  authDomain: "thai-go-game.firebaseapp.com",
  databaseURL: "https://thai-go-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thai-go-game",
  storageBucket: "thai-go-game.firebasestorage.app",
  messagingSenderId: "204988303831",
  appId: "1:204988303831:web:686a889c675a3c4bf56392",
  measurementId: "G-NZLJ3X1H94"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const functions = firebase.functions();
const auth = firebase.auth();

// UI Elements
const qText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const gachaBtn = document.getElementById('gacha-btn');
const exchangeBtn = document.getElementById('exchange-btn');
const resultBox = document.getElementById('result-box');
const charDisplay = document.getElementById('new-char-display');
const resultMsg = document.getElementById('result-msg');

let currentQuestionId = null;

// ================= 1. ระบบควิซ =================
async function loadQuestion() {
    qText.innerText = "กำลังโหลดคำถาม...";
    optionsContainer.innerHTML = '';
    try {
        const getQ = functions.httpsCallable('getQuestion');
        const res = await getQ();
        currentQuestionId = res.data.questionId;
        qText.innerText = res.data.question;
        
        res.data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => submitAnswer(opt);
            optionsContainer.appendChild(btn);
        });
    } catch (err) { console.error(err); qText.innerText = "โหลดคำถามล้มเหลว"; }
}

async function submitAnswer(answerText) {
    const submit = functions.httpsCallable('submitQuizAnswer');
    try {
        const res = await submit({ questionId: currentQuestionId, userAnswerText: answerText });
        if (res.data.correct) alert(`ตอบถูก! ได้รับ ${res.data.goldEarned} Gold`);
        else alert("ตอบผิด ลองใหม่นะ!");
        loadQuestion(); // โหลดข้อใหม่ทันที
    } catch (err) { alert(err.message); }
}

// ================= 2. กาชา & แลกเปลี่ยน =================
function showAnim(char, msg) {
    charDisplay.innerText = char;
    resultMsg.innerText = msg;
    resultBox.classList.remove('hidden');
    charDisplay.classList.remove('animate-pop');
    void charDisplay.offsetWidth; // Force Reflow
    charDisplay.classList.add('animate-pop');
}

gachaBtn.onclick = async () => {
    gachaBtn.disabled = true;
    try {
        const roll = functions.httpsCallable('rollGacha');
        const res = await roll();
        const d = res.data;
        showAnim(d.dropped, d.isNew ? "ได้รับตัวอักษรใหม่!" : `ซ้ำ! ได้รับ ${d.fragmentsAdded} เศษอักษร`);
    } catch (e) { alert(e.message); }
    gachaBtn.disabled = false;
};

exchangeBtn.onclick = async () => {
    exchangeBtn.disabled = true;
    try {
        const ex = functions.httpsCallable('exchangeMissingConsonant');
        const res = await ex();
        showAnim(res.data.obtainedChar, "อัญเชิญสำเร็จ! การันตีอักษรใหม่");
        if(res.data.isCompleted) setTimeout(() => alert("🎉 สะสมครบ 44 ตัว ปลดล็อกท้าวเวสสุวรรณ!"), 2000);
    } catch (e) { alert(e.message); }
    exchangeBtn.disabled = false;
};

// จำลองล็อกอินอัตโนมัติแบบ Anonymous (ในเกมจริงควรใช้ Google/Email Login)
auth.signInAnonymously().then(() => loadQuestion());
