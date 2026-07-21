// ==================== GAME STATE & DATA ====================
let gameState = {
    username: "นักอักษรา",
    uid: "USER_" + Math.floor(100000 + Math.random() * 900000),
    level: 1,
    exp: 0,
    gold: 300,
    selectedCharId: "inao",
    collected: {}, // { 'ก': 2, 'ข': 1 ... }
    items: [],
    hasVessavana: false
};

const SHOP_ITEMS = [
    { id: 'shield_jewel', name: 'ยันต์เกราะเพชร', desc: 'ลดการสูญเสียทองเมื่อแพ้ PK ลง 80%', price: 200, icon: '🛡️' },
    { id: 'ring_power', name: 'แหวนอักขระมนตรา', desc: 'เพิ่มพลังโจมตี (ATK) +40 ในการประลอง PK', price: 350, icon: '💍' },
    { id: 'incense_lure', name: 'เครื่องหอมเรียกอักษร', desc: 'สุ่มเสกอักษรใหม่ขึ้นบนแผนที่ทันที 8 ตัว', price: 150, icon: '🔮' },
    { id: 'exp_talisman', name: 'ยันต์พุฒาจารย์ (EXP x2)', desc: 'ได้รับ EXP จากการจับอักษรเพิ่มขึ้นเป็น 2 เท่า', price: 250, icon: '📜' },
    { id: 'gold_pouch', name: 'ถุงเงินมหาลาภ', desc: 'ได้รับทองจากการจับอักษรเพิ่มขึ้น +50%', price: 300, icon: '🧧' },
    { id: 'compass_rare', name: 'เข็มทิศส่องอักษร', desc: 'ช่วยเพิ่มโอกาสเจออักษรที่ไม่เคยสะสมมาก่อน', price: 180, icon: '🧭' }
];

let selectedCardsForPK = [];
let currentTargetChar = null;
let mediaStream = null;

// Dynamic Viewport Height
function autoFitGameWindow() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
}

window.addEventListener('resize', autoFitGameWindow);
window.addEventListener('DOMContentLoaded', () => {
    autoFitGameWindow();
    loadGameState();
    checkConsonantUnlockCondition();
    renderCharactersList();
    renderConsonantGrid();
    renderShopItems();
    initMapDragControls(); // เปิดใช้งานระบบลากแผนที่
    spawnLettersOnWorldMap(); // สุ่มเกิดอักษรบนแผนที่
    updateHudUI();
    fetchLeaderboardFromFirebase();
});

function handleLoginFlow() {
    const nameInput = document.getElementById('login-username').value.trim();
    if (nameInput) gameState.username = nameInput;
    
    saveGameState();
    saveToFirebaseCloud();

    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    updateHudUI();
}

// ==================== DRAGGABLE MAP SYSTEM ====================
let isDragging = false;
let startX, startY;
let mapPosX = -750, mapPosY = -750;

function initMapDragControls() {
    const viewport = document.getElementById('map-viewport');
    const worldMap = document.getElementById('world-map');
    if (!viewport || !worldMap) return;

    const startDrag = (e) => {
        isDragging = true;
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        startX = pageX - mapPosX;
        startY = pageY - mapPosY;
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        
        mapPosX = pageX - startX;
        mapPosY = pageY - startY;

        // จำกัดขอบเขตไม่ให้ลากหลุดแผนที่
        mapPosX = Math.min(0, Math.max(-1500, mapPosX));
        mapPosY = Math.min(0, Math.max(-1500, mapPosY));

        worldMap.style.transform = `translate(${mapPosX}px, ${mapPosY}px)`;
    };

    const stopDrag = () => { isDragging = false; };

    viewport.addEventListener('mousedown', startDrag);
    viewport.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    viewport.addEventListener('touchstart', startDrag, { passive: false });
    viewport.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
}

// สุ่มวางตัวอักษรไทยทั่วแผนที่โลก
function spawnLettersOnWorldMap() {
    const container = document.getElementById('map-letters-container');
    if (!container) return;
    container.innerHTML = '';

    // สร้าง 12 ตัวอักษรกระจายทั่วแผนที่ 2000x2000px
    for (let i = 0; i < 12; i++) {
        const randomChar = THAI_CONSONANTS[Math.floor(Math.random() * THAI_CONSONANTS.length)];
        const posX = Math.floor(100 + Math.random() * 1800);
        const posY = Math.floor(100 + Math.random() * 1800);

        const node = document.createElement('div');
        node.className = "absolute w-12 h-12 rounded-2xl bg-slate-900/90 border-2 border-yellow-400 text-yellow-300 font-extrabold text-base flex items-center justify-center shadow-xl cursor-pointer animate-bounce active:scale-90 transition-all z-20";
        node.style.left = `${posX}px`;
        node.style.top = `${posY}px`;
        node.innerText = randomChar;

        // เมื่อแตะที่ตัวอักษร ให้เปิดโหมดกล้อง AR จับอักษร
        node.onclick = (e) => {
            e.stopPropagation();
            startARCatchMode(randomChar, node);
        };

        container.appendChild(node);
    }
}

// ==================== AR CAMERA CATCH SYSTEM ====================

function startARCatchMode(char, elementNode) {
    currentTargetChar = { char, node: elementNode };
    document.getElementById('ar-target-letter').innerText = char;
    document.getElementById('ar-catch-modal').classList.remove('hidden');

    const videoElem = document.getElementById('ar-video-feed');
    const fallbackBg = document.getElementById('ar-fallback-bg');

    // เปิดใช้งานกล้องมือถือ (ผ่าน HTTPS บน GitHub Pages)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                mediaStream = stream;
                videoElem.srcObject = stream;
                fallbackBg.classList.add('hidden');
            })
            .catch(err => {
                console.warn("ไม่สามารถเปิดกล้องได้ ใช้ระบบ AR จำลองแทน:", err);
                fallbackBg.classList.remove('hidden');
            });
    } else {
        fallbackBg.classList.remove('hidden');
    }
}

function closeARCatchModal() {
    document.getElementById('ar-catch-modal').classList.add('hidden');
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

function executeCatchInAR() {
    if (!currentTargetChar) return;

    const { char, node } = currentTargetChar;
    if (node) node.remove();

    // บันทึกการสะสมอักษร
    gameState.collected[char] = (gameState.collected[char] || 0) + 1;

    // คำนวณรางวัลและโบนัสจากไอเทมเทวภัณฑ์
    let earnedGold = Math.floor(20 + Math.random() * 30);
    let earnedExp = Math.floor(25 + Math.random() * 20);

    if (gameState.items.includes('gold_pouch')) earnedGold = Math.floor(earnedGold * 1.5);
    if (gameState.items.includes('exp_talisman')) earnedExp *= 2;

    gameState.gold += earnedGold;
    addPlayerExp(gameState, earnedExp);

    closeARCatchModal();
    checkConsonantUnlockCondition();
    renderConsonantGrid();
    saveGameState();
    saveToFirebaseCloud();
    updateHudUI();

    alert(`🎉 จับสำเร็จ!\nได้รับพยัญชนะ [ ${char} ] เข้าคลังอักขระ\n🪙 +${earnedGold} Gold | ⭐ +${earnedExp} EXP`);
}

// ==================== CHARACTERS & SHOP ====================

function checkConsonantUnlockCondition() {
    const uniqueCount = Object.keys(gameState.collected).filter(c => gameState.collected[c] > 0).length;
    if (uniqueCount >= 44 && !gameState.hasVessavana) {
        gameState.hasVessavana = true;
        alert("👹 ปาฏิหาริย์เกิดขึ้น! คุณสะสมพยัญชนะไทยครบทั้ง 44 ตัวแล้ว!\nปลดล็อก 'ท้าวเวสสุวรรณ' ระดับตำนานสำเร็จ!");
        renderCharactersList();
        saveGameState();
        saveToFirebaseCloud();
    }
    const countElem = document.getElementById('unique-letter-count');
    if (countElem) countElem.innerText = `อักษรครบ: ${uniqueCount}/44 ตัว`;
}

function renderShopItems() {
    const container = document.getElementById('shop-items-list');
    if (!container) return;
    container.innerHTML = '';

    SHOP_ITEMS.forEach(item => {
        const isOwned = gameState.items.includes(item.id);
        const div = document.createElement('div');
        div.className = "bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center";
        div.innerHTML = `
            <div class="flex items-center gap-2.5">
                <div class="text-2xl">${item.icon}</div>
                <div>
                    <h5 class="text-xs font-bold text-white title-font">${item.name}</h5>
                    <p class="text-[9px] text-slate-400">${item.desc}</p>
                </div>
            </div>
            <button onclick="buyShopItem('${item.id}', ${item.price})" ${isOwned ? 'disabled' : ''} class="px-2.5 py-1.5 bg-[#ca8a04] disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-lg active:scale-95 transition-all">
                ${isOwned ? 'ครอบครองแล้ว' : item.price + ' 🪙'}
            </button>
        `;
        container.appendChild(div);
    });
}

function buyShopItem(itemId, price) {
    if (gameState.gold < price) { alert("เหรียญทองของคุณไม่เพียงพอ!"); return; }
    gameState.gold -= price;
    gameState.items.push(itemId);

    // หากซื้อเครื่องหอมเรียกอักษร ให้สุ่มอักษรใหม่ขึ้นทันที
    if (itemId === 'incense_lure') {
        spawnLettersOnWorldMap();
        alert("🔮 เครื่องหอมทำงาน! เกิดอักษรเวทใหม่กระจายอยู่ทั่วแผนที่!");
    } else {
        alert("🎉 ซื้อเทวภัณฑ์สำเร็จ!");
    }

    saveGameState();
    saveToFirebaseCloud();
    renderShopItems();
    updateHudUI();
}

function renderCharactersList() {
    const grid = document.getElementById('character-list-grid');
    if (!grid) return;
    grid.innerHTML = '';

    GAME_CHARACTERS.forEach(ch => {
        const isLocked = ch.id === 'vessavana' && !gameState.hasVessavana;
        const isSelected = gameState.selectedCharId === ch.id;

        const card = document.createElement('div');
        let cardBg = ch.rarity === 'Legendary' ? 'legendary-card' : (ch.rarity === 'Epic' ? 'epic-card' : 'bg-slate-900 border-slate-800');
        
        card.className = `p-3 rounded-2xl border flex items-center justify-between ${cardBg} ${isSelected ? 'ring-2 ring-yellow-400' : ''}`;
        card.innerHTML = `
            <div class="flex items-center gap-2.5">
                <div class="w-11 h-11 rounded-full bg-slate-950/80 border border-yellow-400/40 flex items-center justify-center text-xl">${ch.avatar}</div>
                <div>
                    <h5 class="text-xs font-bold text-white title-font">${ch.name} ${isLocked ? '🔒' : ''}</h5>
                    <p class="text-[9px] text-slate-300">${ch.title}</p>
                    <div class="flex gap-1.5 text-[8px] text-yellow-300 font-bold mt-0.5">
                        <span>⚔️${ch.atk}</span> | <span>🛡️${ch.def}</span> | <span>⚡${ch.speed}</span>
                    </div>
                </div>
            </div>
            <button onclick="selectCharacter('${ch.id}')" ${isLocked ? 'disabled' : ''} class="px-2.5 py-1.5 bg-[#ca8a04] disabled:bg-slate-800 text-slate-950 font-bold text-[10px] rounded-lg">
                ${isSelected ? 'เลือกอยู่' : (isLocked ? 'สะสมครบ 44 ตัว' : 'เลือก')}
            </button>
        `;
        grid.appendChild(card);
    });
}

function selectCharacter(charId) {
    gameState.selectedCharId = charId;
    saveGameState();
    renderCharactersList();
    updateHudUI();
}

function renderConsonantGrid() {
    const grid = document.getElementById('consonant-grid');
    if (!grid) return;
    grid.innerHTML = '';

    THAI_CONSONANTS.forEach(char => {
        const count = gameState.collected[char] || 0;
        const card = document.createElement('div');
        const isSelected = selectedCardsForPK.includes(char);

        card.className = `p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            count > 0 ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-600'
        } ${isSelected ? 'ring-2 ring-yellow-400' : ''}`;

        card.innerHTML = `
            <span class="text-sm font-bold">${char}</span>
            <span class="text-[8px] opacity-80">${count > 0 ? 'x' + count : 'ไม่มี'}</span>
        `;
        card.onclick = () => {
            if (count > 0) toggleSelectCardForPK(char);
            else alert(`คุณยังไม่มีอักษร '${char}' สามารถใช้นิ้วลากสำรวจแผนที่เพื่อตามหาได้!`);
        };
        grid.appendChild(card);
    });
}

function toggleSelectCardForPK(char) {
    if (selectedCardsForPK.includes(char)) {
        selectedCardsForPK = selectedCardsForPK.filter(c => c !== char);
    } else {
        if (selectedCardsForPK.length >= 3) { alert("เลือกการ์ดได้สูงสุด 3 ใบ!"); return; }
        selectedCardsForPK.push(char);
    }
    renderConsonantGrid();
    updateSelectedCardsUI();
}

function updateSelectedCardsUI() {
    const bar = document.getElementById('selected-cards-bar');
    if (!bar) return;
    bar.innerHTML = '';
    selectedCardsForPK.forEach(c => {
        const tag = document.createElement('span');
        tag.className = "px-2 py-0.5 bg-yellow-950 border border-yellow-400 text-yellow-300 text-[10px] font-bold rounded-md";
        tag.innerText = `อักษร ${c}`;
        bar.appendChild(tag);
    });
}

// ==================== UI & CLOUD SYNC ====================

function updateHudUI() {
    const currentChar = GAME_CHARACTERS.find(c => c.id === gameState.selectedCharId) || GAME_CHARACTERS[0];
    
    document.getElementById('hud-username').innerText = gameState.username;
    document.getElementById('hud-char-avatar').innerText = currentChar.avatar;
    document.getElementById('player-gold').innerText = gameState.gold.toLocaleString();
    document.getElementById('hud-level-badge').innerText = `Lv.${gameState.level}`;
    
    const mapAvatar = document.getElementById('map-player-avatar');
    const mapName = document.getElementById('map-player-name');
    if (mapAvatar) mapAvatar.innerText = currentChar.avatar;
    if (mapName) mapName.innerText = gameState.username;

    const reqExp = getRequiredExp(gameState.level);
    const expPercent = Math.min(100, Math.floor((gameState.exp / reqExp) * 100));
    document.getElementById('hud-exp-bar').style.width = `${expPercent}%`;
}

function switchTab(tab) {
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('treasury-screen').classList.add('hidden');
    if (tab === 'map') {
        document.getElementById('map-screen').classList.remove('hidden');
    } else {
        document.getElementById('treasury-screen').classList.remove('hidden');
        renderShopItems();
    }
}

function switchSubTab(sub) {
    ['chars', 'inventory', 'leaderboard', 'shop', 'pk'].forEach(s => {
        document.getElementById(`tcontent-${s}`).classList.add('hidden');
        document.getElementById(`ttab-${s}`).className = "flex-1 py-2 text-center text-slate-400";
    });
    document.getElementById(`tcontent-${sub}`).classList.remove('hidden');
    document.getElementById(`ttab-${sub}`).className = "flex-1 py-2 text-center text-[#facc15] border-b-2 border-[#ca8a04]";

    if (sub === 'shop') renderShopItems();
    if (sub === 'leaderboard') fetchLeaderboardFromFirebase();
}

function saveToFirebaseCloud() {
    if (typeof db === 'undefined') return;
    db.collection("players").doc(gameState.uid).set({
        username: gameState.username,
        level: gameState.level,
        gold: gameState.gold,
        selectedCharId: gameState.selectedCharId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

function fetchLeaderboardFromFirebase() {
    const listElem = document.getElementById('leaderboard-list');
    if (!listElem) return;

    if (typeof db === 'undefined') {
        listElem.innerHTML = `<p class="text-xs text-red-400 text-center py-2">กรุณาตั้งค่า Firebase Config ใน js/data.js</p>`;
        return;
    }

    db.collection("players")
        .orderBy("level", "desc")
        .orderBy("gold", "desc")
        .limit(10)
        .get()
        .then(snapshot => {
            listElem.innerHTML = '';
            let rank = 1;
            if (snapshot.empty) {
                listElem.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">ยังไม่มีข้อมูลผู้เล่น</p>`;
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const rankBadge = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : `#${rank}`));
                const item = document.createElement('div');
                item.className = "bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center";
                item.innerHTML = `
                    <div class="flex items-center gap-2.5">
                        <span class="text-sm font-bold w-6 text-center">${rankBadge}</span>
                        <div>
                            <div class="text-xs font-bold text-white">${data.username || 'ผู้พิทักษ์'}</div>
                            <div class="text-[9px] text-yellow-400 font-semibold">Level ${data.level || 1}</div>
                        </div>
                    </div>
                    <div class="text-xs font-bold text-yellow-300">🪙 ${(data.gold || 0).toLocaleString()}</div>
                `;
                listElem.appendChild(item);
                rank++;
            });
        });
}

function startPKMatchmaking() { executePKMatch(gameState, selectedCardsForPK); }
function saveGameState() { localStorage.setItem('thai_go_v45_save', JSON.stringify(gameState)); }
function loadGameState() {
    const saved = localStorage.getItem('thai_go_v45_save');
    if (saved) { try { gameState = { ...gameState, ...JSON.parse(saved) }; } catch(e){} }
}
