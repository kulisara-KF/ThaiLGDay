// ==================== PK & QUIZ ENGINE ====================
let currentQuizIndex = 0;
let quizTimer = null;
let timeLeft = 10;
let isQuizActive = false;
let currentCatchTargetLetter = null;
let activeQuizCallback = null;

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startPKMatchmaking() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    if (isQuizActive) return;
    isQuizActive = true;

    const modal = document.getElementById('pk-battle-modal');
    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');
    const typeTitle = document.getElementById('pk-quiz-type-title');
    
    const playerChar = GAME_CHARACTERS.find(c => c.id === playerState.selectedChar) || GAME_CHARACTERS[0];
    document.getElementById('pk-player-avatar').innerText = playerChar.avatar;
    document.getElementById('pk-player-name').innerText = playerChar.name;

    if (typeTitle) typeTitle.innerText = "⚡ SPEED QUIZ PK";
    if (modal) modal.classList.remove('hidden');
    if (quizBox) quizBox.classList.remove('hidden');
    if (resultBox) resultBox.classList.add('hidden');
    
    activeQuizCallback = handlePKQuizResult;
    loadQuizWithShuffledOptions();
}

function startCatchQuiz(letter) {
    if (isQuizActive) return;
    isQuizActive = true;
    currentCatchTargetLetter = letter;

    const modal = document.getElementById('pk-battle-modal');
    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');
    const typeTitle = document.getElementById('pk-quiz-type-title');

    const playerChar = GAME_CHARACTERS.find(c => c.id === playerState.selectedChar) || GAME_CHARACTERS[0];
    document.getElementById('pk-player-avatar').innerText = playerChar.avatar;
    document.getElementById('pk-player-name').innerText = playerChar.name;

    if (typeTitle) typeTitle.innerText = `📜 ตอบคำถามเพื่อผนึก '${letter}'`;
    if (modal) modal.classList.remove('hidden');
    if (quizBox) quizBox.classList.remove('hidden');
    if (resultBox) resultBox.classList.add('hidden');

    activeQuizCallback = handleCatchQuizResult;
    loadQuizWithShuffledOptions();
}

function loadQuizWithShuffledOptions() {
    currentQuizIndex = Math.floor(Math.random() * QUIZ_DATABASE.length);
    const quiz = QUIZ_DATABASE[currentQuizIndex];
    
    const originalCorrectText = quiz.options[quiz.answer];
    const shuffledOpts = shuffleArray(quiz.options);
    const newCorrectIdx = shuffledOpts.indexOf(originalCorrectText);
    
    window.currentCorrectAnswerIndex = newCorrectIdx;

    const qEl = document.getElementById('pk-quiz-question');
    const optsEl = document.getElementById('pk-quiz-options');
    
    if (qEl) qEl.innerText = quiz.question;
    if (optsEl) {
        optsEl.innerHTML = shuffledOpts.map((opt, idx) => `
            <button onclick="submitQuizAnswer(${idx})" class="btn-game w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-yellow-300 font-semibold text-xs rounded-xl border border-slate-700 text-left">
                ${idx + 1}. ${opt}
            </button>
        `).join('');
    }
    
    startPKTimer();
}

function startPKTimer() {
    clearInterval(quizTimer);
    timeLeft = 10;
    const timerEl = document.getElementById('pk-timer-display');
    if (timerEl) timerEl.innerText = `⏱️ ${timeLeft}s`;
    
    quizTimer = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.innerText = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            submitQuizAnswer(-1);
        }
    }, 1000);
}

function submitQuizAnswer(selectedIdx) {
    clearInterval(quizTimer);
    const isCorrect = selectedIdx === window.currentCorrectAnswerIndex;
    
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSFX(isCorrect ? 'correct' : 'wrong');
    }

    if (typeof activeQuizCallback === 'function') {
        activeQuizCallback(isCorrect);
    }
}

function handlePKQuizResult(isCorrect) {
    if (typeof SoundEngine !== 'undefined' && isCorrect) {
        setTimeout(() => SoundEngine.playSFX('victory'), 300);
    }

    showQuizResultUI(
        isCorrect ? "🎉 ชนะการประลอง PK!" : "💥 พ่ายแพ้ในการประลอง!",
        isCorrect ? "คุณตอบถูกต้อง! ได้รับ +50 Gold และ +100 EXP" : "ตอบผิดหรือหมดเวลา! พยายามใหม่อีกครั้ง"
    );
    if (isCorrect) {
        playerState.gold += 50;
        playerState.exp += 100;
        updateHUD();
        savePlayerDataToFirebase();
    }
}

function handleCatchQuizResult(isCorrect) {
    if (isCorrect) {
        playerState.inventory.push(currentCatchTargetLetter);
        playerState.exp += 30;
        playerState.gold += 15;
        updateHUD();
        savePlayerDataToFirebase();
        showQuizResultUI(
            `✨ ผนึกสำเร็จ!`,
            `คุณตอบถูก! ได้รับอักษร '${currentCatchTargetLetter}' เข้าสู่สมุดสะสมแล้ว`
        );
    } else {
        showQuizResultUI(
            `❌ ผนึกล้มเหลว!`,
            `ตอบผิดทำให้พลังมนตราหลุดรอด อักษร '${currentCatchTargetLetter}' ได้เด้งหนีไปแล้ว`
        );
    }
}

function showQuizResultUI(title, detail) {
    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');
    const titleEl = document.getElementById('pk-result-title');
    const detailEl = document.getElementById('pk-result-detail');
    
    if (quizBox) quizBox.classList.add('hidden');
    if (resultBox) resultBox.classList.remove('hidden');
    if (titleEl) titleEl.innerText = title;
    if (detailEl) detailEl.innerText = detail;
}

function closePKBattleModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    clearInterval(quizTimer);
    isQuizActive = false;
    const modal = document.getElementById('pk-battle-modal');
    if (modal) modal.classList.add('hidden');
}
