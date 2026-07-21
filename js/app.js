// ==================== APP STATE & GLOBALS ====================
let playerState = {
    username: "นักอักษรา",
    level: 1,
    exp: 0,
    gold: 300,
    selectedChar: "inao",
    inventory: ["ก", "ข"],
    selectedCards: []
};

const GAME_SHOP_CATALOG = [
    { id: 'shield_jewel', name: 'ยันต์เกราะเพชร', desc: 'ลดการสูญเสียทองเมื่อแพ้ PK ลง 80%', price: 200, icon: '🛡️' },
    { id: 'ring_power', name: 'แหวนอักขระมนตรา', desc: 'เพิ่มพลังโจมตี (ATK) +40 ในการประลอง PK', price: 350, icon: '💍' },
    { id: 'incense_lure', name: 'เครื่องหอมเรียกอักษร', desc: 'สุ่มเสกอักษรใหม่ขึ้นบนแผนที่ทันที 8 ตัว', price: 150, icon: '🔮' },
    { id: 'exp_talisman', name: 'ยันต์พุฒาจารย์ (EXP x2)', desc: 'ได้รับ EXP จากการจับอักษรเพิ่มขึ้นเป็น 2 เท่า', price: 250, icon: '📜' },
    { id: 'gold_pouch', name: 'ถุงเงินมหาลาภ', desc: 'ได้รับทองจากการจับอักษรเพิ่มขึ้น +50%', price: 300, icon: '🧧' },
    { id: 'compass_rare', name: 'เข็มทิศส่องอักษร', desc: 'ช่วยเพิ่มโอกาสเจออักษรที่ไม่เคยสะสมมาก่อน', price: 180, icon: '🧭' }
];


let selectedCharForModal = null;
let arBounceInterval = null;

// ==================== FIREBASE SYNC FUNCTIONS ====================
function savePlayerDataToFirebase() {
    if (typeof db !== 'undefined' && playerState.username) {
        db.ref('players/' + playerState.username).set({
            level: playerState.level,
            exp: playerState.exp,
            gold: playerState.gold,
            selectedChar: playerState.selectedChar,
            inventory: playerState.inventory,
            lastLogin: new Date().toISOString()
        });
    }
}

function loadPlayerDataFromFirebase(username, callback) {
    if (typeof db !== 'undefined') {
        db.ref('players/' + username).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                playerState.level = data.level || 1;
                playerState.exp = data.exp || 0;
                playerState.gold = data.gold || 300;
                playerState.selectedChar = data.selectedChar || "inao";
                playerState.inventory = data.inventory || ["ก", "ข"];
            }
            if (callback) callback();
        });
    } else {
        if (callback) callback();
    }
}

// ==================== AUDIO TOGGLE ====================
function toggleAudioState() {
    if (typeof SoundEngine === 'undefined') return;
    const isMuted = SoundEngine.toggleMute();
    const btn = document.getElementById('btn-audio-toggle');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
}

// ==================== LOGIN & INITIALIZATION ====================
function handleLoginFlow() {
    if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSFX('click');
        SoundEngine.toggleBGM();
    }

    const inputName = document.getElementById('login-username').value.trim();
    if (inputName) {
        playerState.username = inputName;
    }
    
    loadPlayerDataFromFirebase(playerState.username, () => {
        document.getElementById('hud-username').innerText = playerState.username;
        document.getElementById('map-player-name').innerText = playerState.username;
        
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('main-header').classList.remove('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        
        initMapDrag();
        spawnLettersOnMap();
        updateHUD();
        renderAllUI();
        savePlayerDataToFirebase();
    });
}

function updateHUD() {
    // คำนวณ Level Up
    const reqExp = typeof getRequiredExp === 'function' ? getRequiredExp(playerState.level) : playerState.level * 100;
    if (playerState.exp >= reqExp) {
        playerState.level += 1;
        playerState.exp -= reqExp;
    }

    document.getElementById('hud-username').innerText = playerState.username;
    document.getElementById('hud-level-badge').innerText = `Lv.${playerState.level}`;
    document.getElementById('player-gold').innerText = playerState.gold;
    
    const expPercent = Math.min(100, (playerState.exp / reqExp) * 100);
    document.getElementById('hud-exp-bar').style.width = `${expPercent}%`;
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('treasury-screen').classList.add('hidden');
    
    if (tabName === 'map') {
        document.getElementById('map-screen').classList.remove('hidden');
    } else if (tabName === 'treasury') {
        document.getElementById('treasury-screen').classList.remove('hidden');
        renderAllUI();
    }
}

function switchSubTab(subTabName) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    const tabs = ['chars', 'inventory', 'shop', 'pk'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`ttab-${tab}`);
        const content = document.getElementById(`tcontent-${tab}`);
        if (btn && content) {
            if (tab === subTabName) {
                btn.className = "flex-1 py-3 text-center text-[#facc15] border-b-2 border-[#ca8a04] transition-all";
                content.classList.remove('hidden');
            } else {
                btn.className = "flex-1 py-3 text-center text-slate-400 transition-all";
                content.classList.add('hidden');
            }
        }
    });
}

// ==================== RENDERERS & CHARACTER MODAL ====================
function renderAllUI() {
    renderCharacters();
    renderInventory();
    renderShop();
    renderSelectedCards();
}

function renderCharacters() {
    const container = document.getElementById('character-list-grid');
    if (!container || typeof GAME_CHARACTERS === 'undefined') return;
    
    container.innerHTML = GAME_CHARACTERS.map(char => {
        const isSelected = playerState.selectedChar === char.id;
        const glowClass = char.rarity === 'Legendary' ? 'rune-glow-legend border-amber-400' : (char.rarity === 'Epic' ? 'rune-glow-epic border-purple-400' : 'rune-glow border-yellow-400');
        
        return `
            <div onclick="openCharDetailModal('${char.id}')" class="p-3 bg-slate-900/90 border ${isSelected ? glowClass : 'border-slate-800'} rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${char.avatar}</span>
                    <div>
                        <div class="text-xs font-bold text-yellow-300 title-font">${char.name} <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-400">(${char.rarity})</span></div>
                        <div class="text-[10px] text-slate-400">${char.title}</div>
                    </div>
                </div>
                <div>
                    ${isSelected ? '<span class="text-[9px] text-yellow-300 font-bold bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/40">ใช้งานอยู่</span>' : '<span class="text-[10px] text-slate-400">ดูข้อมูล 🔍</span>'}
                </div>
            </div>
        `;
    }).join('');
}

function openCharDetailModal(charId) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    selectedCharForModal = charId;
    const char = GAME_CHARACTERS.find(c => c.id === charId);
    if (!char) return;

    document.getElementById('cdet-avatar').innerText = char.avatar;
    document.getElementById('cdet-name').innerText = char.name;
    document.getElementById('cdet-title').innerText = char.title;
    document.getElementById('cdet-desc').innerText = char.desc;
    document.getElementById('cdet-atk').innerText = char.atk;
    document.getElementById('cdet-def').innerText = char.def;
    document.getElementById('cdet-spd').innerText = char.speed;

    const selectBtn = document.getElementById('cdet-select-btn');
    if (playerState.selectedChar === charId) {
        selectBtn.innerText = "ใช้งานอยู่ ✓";
        selectBtn.disabled = true;
        selectBtn.className = "btn-game flex-1 py-2 bg-slate-700 text-slate-400 font-bold text-xs rounded-xl";
    } else {
        selectBtn.innerText = "เลือกรบ ⚔️";
        selectBtn.disabled = false;
        selectBtn.className = "btn-game flex-1 py-2 bg-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl";
    }

    document.getElementById('char-detail-modal').classList.remove('hidden');
}

function closeCharDetailModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    document.getElementById('char-detail-modal').classList.add('hidden');
}

function confirmSelectChar() {
    if (selectedCharForModal) {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('correct');
        playerState.selectedChar = selectedCharForModal;
        const charData = GAME_CHARACTERS.find(c => c.id === selectedCharForModal);
        if (charData) {
            document.getElementById('hud-char-avatar').innerText = charData.avatar;
            document.getElementById('map-player-avatar').innerText = charData.avatar;
        }
        renderCharacters();
        closeCharDetailModal();
        savePlayerDataToFirebase();
    }
}

function renderInventory() {
    const container = document.getElementById('consonant-grid');
    if (!container || typeof THAI_CONSONANTS === 'undefined') return;
    
    const uniqueCollected = new Set(playerState.inventory).size;
    const countBadge = document.getElementById('unique-letter-count');
    if (countBadge) countBadge.innerText = `อักษรครบ: ${uniqueCollected}/44 ตัว`;

    container.innerHTML = THAI_CONSONANTS.map(char => {
        const isOwned = playerState.inventory.includes(char);
        return `
            <div onclick="toggleSelectCard('${char}')" class="h-10 rounded-lg flex items-center justify-center font-bold text-sm border cursor-pointer transition-all ${
                isOwned 
                ? 'bg-amber-500/20 border-yellow-400 text-yellow-300 rune-glow' 
                : 'bg-slate-950/80 border-slate-800 text-slate-700'
            }">
                ${char}
            </div>
        `;
    }).join('');
}

function toggleSelectCard(char) {
    if (!playerState.inventory.includes(char)) return;
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    
    const idx = playerState.selectedCards.indexOf(char);
    if (idx > -1) {
        playerState.selectedCards.splice(idx, 1);
    } else {
        if (playerState.selectedCards.length < 3) {
            playerState.selectedCards.push(char);
        }
    }
    renderSelectedCards();
}

function renderSelectedCards() {
    const bar = document.getElementById('selected-cards-bar');
    if (!bar) return;
    if (playerState.selectedCards.length === 0) {
        bar.innerHTML = '<span class="text-[10px] text-slate-500 italic">ยังไม่ได้เลือกการ์ดเสริมพลัง</span>';
        return;
    }
    bar.innerHTML = playerState.selectedCards.map(c => `
        <span class="px-2.5 py-1 bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-bold text-xs rounded-lg shadow-sm">${c}</span>
    `).join('');
}

function renderShop() {
    const container = document.getElementById('shop-items-list');
    if (!container) return;
    container.innerHTML = GAME_SHOP_CATALOG.map(item => `
        <div class="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-3">
                <span class="text-3xl">${item.icon}</span>
                <div>
                    <div class="text-xs font-bold text-slate-200 title-font">${item.name}</div>
                    <div class="text-[10px] text-slate-400">${item.desc}</div>
                </div>
            </div>
            <button onclick="buyShopItem('${item.id}', ${item.price})" class="btn-game px-3.5 py-1.5 bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl">
                🪙 ${item.price}
            </button>
        </div>
    `).join('');
}

function buyShopItem(itemId, price) {
    if (playerState.gold >= price) {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('buy');
        playerState.gold -= price;
        playerState.exp += 20;
        updateHUD();
        savePlayerDataToFirebase();
        alert("ซื้อไอเทมสำเร็จ!");
    } else {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('wrong');
        alert("เหรียญทองไม่พอ!");
    }
}

// ==================== MAP & DRAG SYSTEM ====================
let isDragging = false;
let startX, startY, currentX = -750, currentY = -750;

function initMapDrag() {
    const viewport = document.getElementById('map-viewport');
    const map = document.getElementById('world-map');
    if (!viewport || !map) return;

    const startDrag = (e) => {
        isDragging = true;
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        startX = pageX - currentX;
        startY = pageY - currentY;
    };

    const moveDrag = (e) => {
        if (!isDragging) return;
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        currentX = pageX - startX;
        currentY = pageY - startY;
        
        currentX = Math.min(0, Math.max(-1500, currentX));
        currentY = Math.min(0, Math.max(-1500, currentY));
        
        map.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    const stopDrag = () => { isDragging = false; };

    viewport.addEventListener('mousedown', startDrag);
    viewport.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', stopDrag);

    viewport.addEventListener('touchstart', startDrag);
    viewport.addEventListener('touchmove', moveDrag);
    window.addEventListener('touchend', stopDrag);
}

function spawnLettersOnMap() {
    const container = document.getElementById('map-letters-container');
    if (!container || typeof THAI_CONSONANTS === 'undefined') return;
    
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const randomChar = THAI_CONSONANTS[Math.floor(Math.random() * THAI_CONSONANTS.length)];
        const top = Math.floor(Math.random() * 1800) + 100;
        const left = Math.floor(Math.random() * 1800) + 100;

        const letterEl = document.createElement('div');
        letterEl.className = 'absolute w-10 h-10 rounded-full bg-amber-500/20 border border-yellow-400 flex items-center justify-center font-bold text-yellow-300 text-lg shadow-lg rune-glow cursor-pointer animate-bounce';
        letterEl.style.top = `${top}px`;
        letterEl.style.left = `${left}px`;
        letterEl.innerText = randomChar;
        letterEl.onclick = () => openARCatchModal(randomChar, letterEl);

        container.appendChild(letterEl);
    }
}

// ==================== AR CAMERA & BOUNCING TARGET ====================
let targetLetterElement = null;
let currentTargetLetter = 'ก';

function openARCatchModal(letter, element) {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    currentTargetLetter = letter;
    targetLetterElement = element;
    
    const modal = document.getElementById('ar-catch-modal');
    const targetDisplay = document.getElementById('ar-target-letter');
    const video = document.getElementById('ar-video-feed');
    const fallback = document.getElementById('ar-fallback-bg');

    if (targetDisplay) targetDisplay.innerHTML = `<div class="absolute inset-0 rounded-3xl radar-ring pointer-events-none"></div>${letter}`;
    if (modal) modal.classList.remove('hidden');

    startARLetterMovement();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                video.srcObject = stream;
                fallback.classList.add('hidden');
            })
            .catch(() => {
                fallback.classList.remove('hidden');
            });
    } else {
        fallback.classList.remove('hidden');
    }
}

function startARLetterMovement() {
    clearInterval(arBounceInterval);
    const target = document.getElementById('ar-target-letter');
    if (!target) return;
    
    target.style.top = '40%';
    target.style.left = '40%';

    arBounceInterval = setInterval(() => {
        const randomTop = Math.floor(Math.random() * 65) + 15;
        const randomLeft = Math.floor(Math.random() * 65) + 15;
        target.style.top = `${randomTop}%`;
        target.style.left = `${randomLeft}%`;

        if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('bounce');
    }, 500);
}

function closeARCatchModal() {
    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('click');
    clearInterval(arBounceInterval);
    const modal = document.getElementById('ar-catch-modal');
    const video = document.getElementById('ar-video-feed');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (modal) modal.classList.add('hidden');
}

function executeCatchInAR() {
    if (typeof isQuizActive !== 'undefined' && isQuizActive) return;

    if (typeof SoundEngine !== 'undefined') SoundEngine.playSFX('catch_seal');

    clearInterval(arBounceInterval);
    const caughtLetter = currentTargetLetter;
    
    if (targetLetterElement) {
        targetLetterElement.remove();
    }
    
    closeARCatchModal();
    
    if (typeof startCatchQuiz === 'function') {
        startCatchQuiz(caughtLetter);
    }
}
