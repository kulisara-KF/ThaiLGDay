// ==================== PK & QUIZ ENGINE ====================
let pkTimer = null;
let pkTimeLeft = 10;
let isPKActive = false;
let catchTargetLetter = null;

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ---------------- 1. CATCH QUIZ SYSTEM (แยกเฉพาะการจับอักษร) ----------------
function startCatchQuiz(letter) {
    catchTargetLetter = letter;
    const modal = document.getElementById('catch-quiz-modal');
    const qEl = document.getElementById('catch-quiz-question');
    const optsEl = document.getElementById('catch-quiz-options');

    const quiz = QUIZ_DATABASE[Math.floor(Math.random() * QUIZ_DATABASE.length)];
    const originalCorrectText = quiz.options[quiz.answer];
    const shuffledOpts = shuffleArray(quiz.options);
    const newCorrectIdx = shuffledOpts.indexOf(originalCorrectText);

    if (qEl) qEl.innerText = quiz.question;
    if (optsEl) {
        optsEl.innerHTML = shuffledOpts.map((opt, idx) => `
            <button onclick="submitCatchQuizAnswer(${idx === newCorrectIdx})" class="btn-game w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-semibold text-xs rounded-xl border border-slate-700 text-left">
                ${idx + 1}. ${opt}
            </button>
        `).join('');
    }

    if (modal) modal.classList.remove('hidden');
}

function submitCatchQuizAnswer(isCorrect) {
    const modal = document.getElementById('catch-quiz-modal');
    if (modal) modal.classList.add('hidden');

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSFX(isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) {
        playerState.inventory.push(catchTargetLetter);
        playerState.exp += 30;
        playerState.gold += 15;
        updateHUD();
        savePlayerDataToFirebase();
        showNotificationToast("🎉 สำเร็จ!", `ตอบถูก! ได้รับอักษร '${catchTargetLetter}' เข้าสู่สมุดสะสมแล้ว`, "✨");
    } else {
        showNotificationToast("❌ ผนึกล้มเหลว!", `ตอบผิด! อักษร '${catchTargetLetter}' ได้เด้งหนีไปแล้ว`, "💨");
    }
}

// ---------------- 2. SPEED QUIZ PK SYSTEM (ประลองต่อสู้) ----------------
function startPKMatchmaking() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    if (isPKActive) return;
    isPKActive = true;

    const modal = document.getElementById('pk-battle-modal');
    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');

    const playerChar = GAME_CHARACTERS.find(c => c.id === playerState.selectedChar) || GAME_CHARACTERS[1];
    document.getElementById('pk-player-avatar').innerText = playerChar.avatar || "🗡️";
    document.getElementById('pk-player-name').innerText = playerChar.name || "ผู้พิทักษ์";

    if (modal) modal.classList.remove('hidden');
    if (quizBox) quizBox.classList.remove('hidden');
    if (resultBox) resultBox.classList.add('hidden');

    loadPKQuiz();
}

function loadPKQuiz() {
    const quiz = QUIZ_DATABASE[Math.floor(Math.random() * QUIZ_DATABASE.length)];
    const originalCorrectText = quiz.options[quiz.answer];
    const shuffledOpts = shuffleArray(quiz.options);
    window.currentPKCorrectIdx = shuffledOpts.indexOf(originalCorrectText);

    const qEl = document.getElementById('pk-quiz-question');
    const optsEl = document.getElementById('pk-quiz-options');

    if (qEl) qEl.innerText = quiz.question;
    if (optsEl) {
        optsEl.innerHTML = shuffledOpts.map((opt, idx) => `
            <button onclick="submitPKAnswer(${idx})" class="btn-game w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-semibold text-xs rounded-xl border border-slate-700 text-left">
                ${idx + 1}. ${opt}
            </button>
        `).join('');
    }

    startPKTimer();
}

function startPKTimer() {
    clearInterval(pkTimer);
    pkTimeLeft = 10;
    const timerEl = document.getElementById('pk-timer-display');
    if (timerEl) timerEl.innerText = `⏱️ ${pkTimeLeft}s`;

    pkTimer = setInterval(() => {
        pkTimeLeft--;
        if (timerEl) timerEl.innerText = `⏱️ ${pkTimeLeft}s`;
        if (pkTimeLeft <= 0) {
            clearInterval(pkTimer);
            submitPKAnswer(-1);
        }
    }, 1000);
}

function submitPKAnswer(selectedIdx) {
    clearInterval(pkTimer);
    const isCorrect = selectedIdx === window.currentPKCorrectIdx;

    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSFX(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setTimeout(() => SoundEngine.playSFX('victory'), 250);
    }

    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');
    const titleEl = document.getElementById('pk-result-title');
    const detailEl = document.getElementById('pk-result-detail');

    if (quizBox) quizBox.classList.add('hidden');
    if (resultBox) resultBox.classList.remove('hidden');

    if (isCorrect) {
        playerState.gold += 50;
        playerState.exp += 100;
        updateHUD();
        savePlayerDataToFirebase();
        if (titleEl) titleEl.innerText = "🎉 ชนะการประลอง PK!";
        if (detailEl) detailEl.innerText = "คุณทำความเสียหายรุนแรงใส่คู่ต่อสู้! ได้รับ +50 🪙 และ +100 EXP";
    } else {
        if (titleEl) titleEl.innerText = "💥 พ่ายแพ้ในการประลอง!";
        if (detailEl) detailEl.innerText = "ตอบผิดหรือหมดเวลา! พยายามใหม่อีกครั้งในการประลองรอบหน้า";
    }
}

function closePKBattleModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    clearInterval(pkTimer);
    isPKActive = false;
    const modal = document.getElementById('pk-battle-modal');
    if (modal) modal.classList.add('hidden');
}
