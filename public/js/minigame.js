const gameArea = document.getElementById('game-area');
const target = document.getElementById('target-letter');
const orb = document.getElementById('magic-orb');

let targetPos = { x: 100, y: 100, dx: 3, dy: 3, isCaptured: false, evadeChance: 20 };
let orbData = { isThrown: false };

// ให้ตัวอักษรวิ่งไปมา
function gameLoop() {
    if (targetPos.isCaptured) return;
    
    // ขยับปกติ
    targetPos.x += targetPos.dx;
    targetPos.y += targetPos.dy;

    // ชนขอบเด้งกลับ
    if (targetPos.x <= 0 || targetPos.x >= gameArea.clientWidth - 30) targetPos.dx *= -1;
    if (targetPos.y <= 0 || targetPos.y >= gameArea.clientHeight - 30) targetPos.dy *= -1;

    // ถ้าลูกแก้วกำลังลอยมา มีโอกาสพุ่งหลบ (Dash)
    if (orbData.isThrown && Math.random() * 100 < 2) { 
        if (Math.random() * 100 < targetPos.evadeChance) {
            targetPos.dx *= -1; 
            targetPos.dy *= -1;
            targetPos.x += targetPos.dx * 10; // กระชากหลบ
        }
    }

    target.style.left = targetPos.x + 'px';
    target.style.top = targetPos.y + 'px';
    requestAnimationFrame(gameLoop);
}

// ปาลูกแก้วเมื่อคลิกที่จอ
gameArea.addEventListener('mousedown', (e) => {
    if (orbData.isThrown || targetPos.isCaptured) return;
    
    // ดึงพิกัดเมาส์เทียบกับกล่อง gameArea
    const rect = gameArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    orbData.isThrown = true;
    orb.classList.remove('hidden');
    orb.style.left = (gameArea.clientWidth / 2) + 'px';
    orb.style.top = gameArea.clientHeight + 'px';

    // อนิเมชันลูกแก้วลอยไปจุดที่คลิก (หน่วงเวลา 0.5 วินาที)
    setTimeout(() => {
        orb.style.left = clickX + 'px';
        orb.style.top = clickY + 'px';
    }, 50);

    // เช็คผลปะทะหลังลูกแก้วเดินทางถึง
    setTimeout(() => {
        checkHit(clickX, clickY);
    }, 550);
});

function checkHit(orbX, orbY) {
    orb.classList.add('hidden');
    orbData.isThrown = false;
    
    const dist = Math.hypot(targetPos.x - orbX, targetPos.y - orbY);
    if (dist < 40) { // รัศมี Hitbox
        targetPos.isCaptured = true;
        target.innerText = "จับได้แล้ว!";
        target.style.color = "#2ecc71";
    }
}

gameLoop();
