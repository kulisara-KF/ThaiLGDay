// ฟังก์ชันสำหรับกลับไปหน้ากล้อง AR (สมมติว่าไฟล์หลักคุณชื่อ index.html)
function returnToAR() {
    // เซฟข้อมูลคะแนนหรือไอเทมก่อนกลับหน้าหลัก
    localStorage.setItem("playerCurrentHp", player.hp); 
    
    // สลับหน้าเว็บกลับไปที่ไฟล์ AR เดิมของคุณ
    window.location.href = "index.html"; 
}
// ==================== 1. GAME STATE ====================
let player = { 
    maxHp: 500, hp: 500, 
    atk: 50, 
    mana: 0, maxMana: 5, 
    combo: 0, 
    shieldActive: false 
};

let enemy = { 
    maxHp: 1000, hp: 1000, 
    def: 10 
};

// ==================== 2. UI MANAGER ====================
function updateBattleUI() {
    let enemyHpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    document.getElementById("enemy-hp-bar").style.width = enemyHpPercent + "%";
    document.getElementById("enemy-hp-text").innerText = `${Math.floor(enemy.hp)}/${enemy.maxHp}`;

    let playerHpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
    document.getElementById("player-hp-bar").style.width = playerHpPercent + "%";
    document.getElementById("player-hp-text").innerText = `${Math.floor(player.hp)}/${player.maxHp}`;

    let manaPercent = (player.mana / player.maxMana) * 100;
    document.getElementById("player-mana-bar").style.width = manaPercent + "%";
    document.getElementById("player-mana-text").innerText = `${player.mana}/${player.maxMana}`;
}

// ==================== 3. ANIMATION ====================
function triggerDamageAnimation(target, damage) {
    let charBox, floatText;
    
    if (target === "enemy") {
        charBox = document.querySelector(".enemy-side");
        floatText = document.getElementById("enemy-damage-float");
    } else {
        charBox = document.querySelector(".player-side");
        floatText = document.getElementById("player-damage-float");
    }

    charBox.classList.remove("damage-shake");
    floatText.classList.remove("show-damage");

    // ใช้ timeout นิดหน่อยเพื่อรีเซ็ตแอนิเมชันให้เล่นซ้ำได้
    setTimeout(() => {
        charBox.classList.add("damage-shake");
        floatText.innerText = "-" + Math.floor(damage);
        floatText.classList.add("show-damage");
    }, 10);
}

// ==================== 4. CARD SYSTEM ====================
function renderCards() {
    const cardHand = document.getElementById("card-hand");
    cardHand.innerHTML = ""; 

    POWER_CARDS.forEach(card => {
        let cardElement = document.createElement("div");
        cardElement.className = "power-card";
        
        if (player.mana < card.manaCost) {
            cardElement.style.opacity = "0.5";
            cardElement.style.cursor = "not-allowed";
        }

        cardElement.innerHTML = `
            <div class="card-cost">${card.manaCost}</div>
            <h4>${card.name}</h4>
            <span style="font-size: 12px; text-align: center;">${card.desc}</span>
        `;

        cardElement.onclick = () => useCard(card);
        cardHand.appendChild(cardElement);
    });
}

function useCard(card) {
    if (player.mana >= card.manaCost) {
        player.mana -= card.manaCost; 
        card.effect(player, enemy); 
        
        if (card.type === "offensive") {
            let damage = (player.atk * 1.5) - enemy.def;
            triggerDamageAnimation("enemy", damage);
        } else if (card.type === "support" || card.type === "defensive") {
             // สำหรับบัฟ อาจจะทำเอฟเฟกต์สีเขียว/ฟ้า เพิ่มทีหลังได้
        }

        updateBattleUI(); 
        renderCards(); 
        checkWinLose(); 
    } else {
        alert("Mana ของคุณไม่เพียงพอ!");
    }
}

// ==================== 5. QUIZ INTEGRATION ====================
function onAnswerQuestion(isCorrect) {
    if (isCorrect) {
        player.combo++;
        if (player.mana < player.maxMana) player.mana++;
        
        let damage = player.atk - enemy.def;
        enemy.hp -= damage;
        triggerDamageAnimation("enemy", damage);
    } else {
        player.combo = 0; 
        
        let enemyDamage = 40;
        if (player.shieldActive) {
            enemyDamage /= 2; 
            player.shieldActive = false; 
        }
        player.hp -= enemyDamage;
        triggerDamageAnimation("player", enemyDamage);
    }
    
    updateBattleUI();
    renderCards();
    checkWinLose();
}

// ==================== 6. WIN/LOSE CHECK ====================
function checkWinLose() {
    if (enemy.hp <= 0) {
        setTimeout(() => {
            alert("ยินดีด้วย! คุณปราบจ้าวแห่งไวยากรณ์สำเร็จ");
            enemy.hp = enemy.maxHp; // รีเซ็ตบอสชั่วคราวเผื่อเล่นต่อ
            updateBattleUI();
        }, 500);
    } else if (player.hp <= 0) {
        setTimeout(() => {
            alert("คุณพ่ายแพ้! พยายามใหม่อีกครั้ง");
            player.hp = player.maxHp; // รีเซ็ตเลือดชั่วคราว
            player.mana = 0;
            updateBattleUI();
            renderCards();
        }, 500);
    }
}

// ==================== INIT ====================
window.onload = () => {
    updateBattleUI();
    renderCards();
};
