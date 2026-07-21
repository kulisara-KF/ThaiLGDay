// ==================== PK BATTLE ENGINE & SPEED QUIZ ====================
let pkTimer = null;

/**
 * เริ่มการประลอง PK ด้วย Speed Quiz
 * @param {Object} playerState - ข้อมูลสถานะของผู้เล่นปัจจุบัน
 * @param {Array} selectedCardList - รายการการ์ดพยัญชนะที่เลือกเสริมพลัง
 */
function executePKMatch(playerState, selectedCardList) {
    const modal = document.getElementById('pk-battle-modal');
    const quizBox = document.getElementById('pk-quiz-box');
    const resultBox = document.getElementById('pk-result-box');

    // แสดงหน้าต่างคำถาม และซ่อนหน้าต่างผลลัพธ์
    quizBox.classList.remove('hidden');
    resultBox.classList.add('hidden');
    modal.classList.remove('hidden');

    // สุ่มคำถามจาก QUIZ_DATABASE ใน data.js
    const randomQuiz = QUIZ_DATABASE[Math.floor(Math.random() * QUIZ_DATABASE.length)];
    document.getElementById('pk-quiz-question').innerText = randomQuiz.question;
    
    const optBox = document.getElementById('pk-quiz-options');
    optBox.innerHTML = '';
    
    // สร้างปุ่มตัวเลือกคำตอบ
    randomQuiz.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "w-full py-2.5 bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl hover:border-yellow-400 active:scale-95 transition-all";
        btn.innerText = opt;
        btn.onclick = () => finishSpeedQuiz(idx === randomQuiz.answer, playerState, selectedCardList);
        optBox.appendChild(btn);
    });

    // ระบบนับถอยหลัง 10 วินาที
    let timeLeft = 10;
    document.getElementById('pk-timer-display').innerText = `⏱️ ${timeLeft}s`;
    
    if (pkTimer) clearInterval(pkTimer);
    pkTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('pk-timer-display').innerText = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(pkTimer);
            finishSpeedQuiz(false, playerState, selectedCardList); // หมดเวลาถือว่าตอบผิด
        }
    }, 1000);
}

/**
 * คำนวณผลการประลองเมื่อตอบคำถามหรือหมดเวลา
 */
function finishSpeedQuiz(isCorrect, playerState, selectedCardList) {
    clearInterval(pkTimer);

    // ดึงข้อมูลตัวละครปัจจุบัน
    const pChar = GAME_CHARACTERS.find(c => c.id === playerState.selectedCharId) || GAME_CHARACTERS[0];
    
    // คำนวณพลังโจมตี
    const cardBonus = selectedCardList.length * 25; // โบนัสจากการ์ดอักษรที่เลือก
    const quizMultiplier = isCorrect ? 1.5 : 1.0; // ตอบถูกได้โบนัสพลัง x1.5
    const ringBonus = playerState.items.includes('ring_power') ? 40 : 0; // โบนัสจากแหวนอักขระ

    const totalPlayerPower = Math.floor((pChar.atk + cardBonus + ringBonus) * quizMultiplier);
    const botAtk = Math.floor(100 + Math.random() * 160); // สุ่มพลังของคู่ต่อสู้
    const isPlayerWin = totalPlayerPower >= botAtk;

    // สลับการแสดงผลหน้าต่างคำถาม -> หน้าต่างสรุปผล
    document.getElementById('pk-quiz-box').classList.add('hidden');
    document.getElementById('pk-result-box').classList.remove('hidden');

    const resultTitle = document.getElementById('pk-result-title');
    const resultDetail = document.getElementById('pk-result-detail');

    if (isPlayerWin) {
        const stolenGold = Math.floor(60 + Math.random() * 90);
        const gainedExp = Math.floor(40 + Math.random() * 30);

        playerState.gold += stolenGold;
        addPlayerExp(playerState, gainedExp);

        resultTitle.innerText = "🏆 ชัยชนะอันทรงเกียรติ!";
        resultTitle.className = "text-sm font-bold text-yellow-400 title-font";
        resultDetail.innerHTML = `
            <p class="text-emerald-400 font-bold">• พลังของคุณ: ${totalPlayerPower} (โบนัสตอบถูก x${quizMultiplier})</p>
            <p class="text-red-400">• พลังคู่ต่อสู้: ${botAtk}</p>
            <p class="text-yellow-300 font-bold border-t border-slate-800 pt-1 mt-1">💰 ได้รับทอง: +${stolenGold} 🪙 | ⭐ ได้รับ EXP: +${gainedExp}</p>
        `;
    } else {
        let lostGold = Math.floor(30 + Math.random() * 50);
        // หากมีไอเทมยันต์เกราะเพชร ลดการสูญเสียทอง 80%
        if (playerState.items.includes('shield_jewel')) {
            lostGold = Math.floor(lostGold * 0.2);
        }
        
        playerState.gold = Math.max(0, playerState.gold - lostGold);
        addPlayerExp(playerState, 10); // ได้รับ EXP เล็กน้อยแม้จะแพ้

        resultTitle.innerText = "💀 พ่ายแพ้ในการประลอง!";
        resultTitle.className = "text-sm font-bold text-red-500 title-font";
        resultDetail.innerHTML = `
            <p class="text-slate-300">• พลังของคุณ: ${totalPlayerPower}</p>
            <p class="text-red-400">• พลังคู่ต่อสู้: ${botAtk}</p>
            <p class="text-red-400 font-bold border-t border-slate-800 pt-1 mt-1">💸 ถูกขโมยทอง: -${lostGold} 🪙 | ⭐ ได้รับ EXP: +10</p>
        `;
    }

    // บันทึกสถานะเกมลง LocalStorage และ Firebase Cloud
    saveGameState();
    saveToFirebaseCloud();
    updateHudUI();
}

/**
 * ระบบเพิ่ม EXP และคำนวณการอัปเลเวลไร้ขีดจำกัด (Infinite Leveling)
 */
function addPlayerExp(playerState, amount) {
    playerState.exp += amount;
    let reqExp = getRequiredExp(playerState.level);

    // เช็กอัปเลเวลแบบวนลูปกรณีได้ EXP เยอะจนข้ามหลายเลเวล
    while (playerState.exp >= reqExp) {
        playerState.exp -= reqExp;
        playerState.level++;
        reqExp = getRequiredExp(playerState.level);
        
        // แสดงแจ้งเตือนเลเวลอัป
        setTimeout(() => {
            alert(`🎉 ปาฏิหาริย์! คุณอัปเลเวลบรรลุ Level ${playerState.level} แล้ว!`);
        }, 300);
    }
}

/**
 * ปิด Modal หน้าต่างการประลอง
 */
function closePKBattleModal() {
    document.getElementById('pk-battle-modal').classList.add('hidden');
}
