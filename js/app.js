// ==================== APP STATE & GLOBALS ====================
let playerState = {
    username: "นักอักษรา",
    level: 1,
    exp: 0,
    gold: 300,
    selectedChar: "inao",
    unlockedChars: ["inao"],
    inventory: ["ก", "ข"],
    selectedCards: []
};

// ใช้ window Object เพื่อป้องกันปัญหา SyntaxError เรื่องการประกาศตัวแปรซ้ำ
window.SHOP_ITEMS = window.SHOP_ITEMS || [
    { id: "item_exp", name: "ยามงคล EXP", desc: "เพิ่ม EXP +50", price: 50, icon: "🧪" },
    { id: "item_radar", name: "เนตรทิพย์อักขระ", desc: "สแกนหาตัวอักษรหายาก", price: 100, icon: "🔮" },
    { id: 'shield_jewel', name: 'ยันต์เกราะเพชร', desc: 'ลดการสูญเสียทองเมื่อแพ้ PK ลง 80%', price: 200, icon: '🛡️' },
    { id: 'ring_power', name: 'แหวนอักขระมนตรา', desc: 'เพิ่มพลังโจมตี (ATK) +40 ในการประลอง PK', price: 350, icon: '💍' },
    { id: 'incense_lure', name: 'เครื่องหอมเรียกอักษร', desc: 'สุ่มเสกอักษรใหม่ขึ้นบนแผนที่ทันที 8 ตัว', price: 150, icon: '🔮' },
    { id: 'exp_talisman', name: 'ยันต์พุฒาจารย์ (EXP x2)', desc: 'ได้รับ EXP จากการจับอักษรเพิ่มขึ้นเป็น 2 เท่า', price: 250, icon: '📜' },
    { id: 'gold_pouch', name: 'ถุงเงินมหาลาภ', desc: 'ได้รับทองจากการจับอักษรเพิ่มขึ้น +50%', price: 300, icon: '🧧' },
    { id: 'compass_rare', name: 'เข็มทิศส่องอักษร', desc: 'ช่วยเพิ่มโอกาสเจออักษรที่ไม่เคยสะสมมาก่อน', price: 180, icon: '🧭' }
];

// ==================== LOGIN & INITIALIZATION ====================
function handleLoginFlow() {
    const inputName = document.getElementById('login-username').value.trim();
    if (inputName) {
        playerState.username = inputName;
    }
    
    document.getElementById('hud-username').innerText = playerState.username;
    document.getElementById('map-player-name').innerText = playerState.username;
    
    document.getElementById('splash-screen').classList.add('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    
    initMapDrag();
    spawnLettersOnMap();
    updateHUD();
    renderAllUI();
}

function updateHUD() {
    document.getElementById('hud-username').innerText = playerState.username;
    document.getElementById('hud-level-badge').innerText = `Lv.${playerState.level}`;
    document.getElementById('player-gold').innerText = playerState.gold;
    
    const reqExp = typeof getRequiredExp === 'function' ? getRequiredExp(playerState.level) : playerState.level * 100;
    const expPercent = Math.min(100, (playerState.exp / reqExp) * 100);
    document.getElementById('hud-exp-bar').style.width = `${expPercent}%`;
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
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
    const tabs = ['chars', 'inventory', 'shop', 'pk', 'leaderboard'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`ttab-${tab}`);
        const content = document.getElementById(`tcontent-${tab}`);
        if (btn && content) {
            if (tab === subTabName) {
                btn.className = "flex-1 py-2.5 text-center text-[#facc15] border-b-2 border-[#ca8a04]";
                content.classList.remove('hidden');
            } else {
                btn.className = "flex-1 py-2.5 text-center text-slate-400";
                content.classList.add('hidden');
            }
        }
    });
}

// ==================== RENDERERS ====================
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
        return `
            <div onclick="selectCharacter('${char.id}')" class="p-3 bg-slate-900 border ${isSelected ? 'border-yellow-400 rune-glow' : 'border-slate-800'} rounded-xl flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${char.avatar}</span>
                    <div>
                        <div class="text-xs font-bold text-yellow-300">${char.name} <span class="text-[10px] text-slate-400">(${char.rarity})</span></div>
                        <div class="text-[10px] text-slate-400">${char.title}</div>
                        <div class="text-[10px] text-amber-400/80 mt-0.5">ATK: ${char.atk} | DEF: ${char.def} | SPD: ${char.speed}</div>
                    </div>
                </div>
                ${isSelected ? '<span class="text-xs text-yellow-400 font-bold">✓ เลือกรบ</span>' : ''}
            </div>
        `;
    }).join('');
}

function selectCharacter(charId) {
    playerState.selectedChar = charId;
    const charData = GAME_CHARACTERS.find(c => c.id === charId);
    if (charData) {
        document.getElementById('hud-char-avatar').innerText = charData.avatar;
        document.getElementById('map-player-avatar').innerText = charData.avatar;
    }
    renderCharacters();
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
            <div onclick="toggleSelectCard('${char}')" class="h-10 rounded-lg flex items-center justify-center font-bold text-sm border cursor-pointer ${
                isOwned 
                ? 'bg-amber-500/20 border-yellow-400 text-yellow-300 rune-glow' 
                : 'bg-slate-950 border-slate-800 text-slate-700'
            }">
                ${char}
            </div>
        `;
    }).join('');
}

function toggleSelectCard(char) {
    if (!playerState.inventory.includes(char)) return;
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
        <span class="px-2 py-1 bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-bold text-xs rounded-md">${c}</span>
    `).join('');
}

function renderShop() {
    const container = document.getElementById('shop-items-list');
    if (!container || !window.SHOP_ITEMS) return;
    container.innerHTML = window.SHOP_ITEMS.map(item => `
        <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <span class="text-2xl">${item.icon}</span>
                <div>
                    <div class="text-xs font-bold text-slate-200">${item.name}</div>
                    <div class="text-[10px] text-slate-400">${item.desc}</div>
                </div>
            </div>
            <button onclick="buyShopItem('${item.id}', ${item.price})" class="px-3 py-1 bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg">
                🪙 ${item.price}
            </button>
        </div>
    `).join('');
}

function buyShopItem(itemId, price) {
    if (playerState.gold >= price) {
        playerState.gold -= price;
        playerState.exp += 20;
        updateHUD();
        alert("ซื้อไอเทมสำเร็จ!");
    } else {
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

// ==================== AR CAMERA SYSTEM ====================
let targetLetterElement = null;
let currentTargetLetter = 'ก';

function openARCatchModal(letter, element) {
    currentTargetLetter = letter;
    targetLetterElement = element;
    
    const modal = document.getElementById('ar-catch-modal');
    const targetDisplay = document.getElementById('ar-target-letter');
    const video = document.getElementById('ar-video-feed');
    const fallback = document.getElementById('ar-fallback-bg');

    if (targetDisplay) targetDisplay.innerText = letter;
    if (modal) modal.classList.remove('hidden');

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

function closeARCatchModal() {
    const modal = document.getElementById('ar-catch-modal');
    const video = document.getElementById('ar-video-feed');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (modal) modal.classList.add('hidden');
}

function executeCatchInAR() {
    playerState.inventory.push(currentTargetLetter);
    playerState.exp += 30;
    playerState.gold += 15;
    
    if (targetLetterElement) {
        targetLetterElement.remove();
    }
    
    updateHUD();
    closeARCatchModal();
    alert(`🎉 ยินดีด้วย! คุณสะสมอักษร '${currentTargetLetter}' สำเร็จ!`);
}
