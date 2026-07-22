const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ฐานข้อมูลคำถาม (ใส่เพิ่มได้เลย)
const RAW_QUIZ_DATABASE = [
    { question: 'ระบบเสียงในภาษาไทยแบ่งออกเป็นกี่หน่วย', options: ['3', '2', '1', '4'], answer: 0 },
    { question: 'วันภาษาไทยแห่งชาติคือ', options: ['29 กรกฎาคม', '30 เมษายน', '5 มีนาคม', '1 สิงหาคม'], answer: 0 }
];

const ALL_CONSONANTS = [
    "ก", "ข", "ฃ", "ค", "ฅ", "ฆ", "ง", "จ", "ฉ", "ช", "ซ", "ฌ", "ญ", "ฎ", "ฏ", 
    "ฐ", "ฑ", "ฒ", "ณ", "ด", "ต", "ถ", "ท", "ธ", "น", "บ", "ป", "ผ", "ฝ", "พ", 
    "ฟ", "ภ", "ม", "ย", "ร", "ล", "ว", "ศ", "ษ", "ส", "ห", "ฬ", "อ", "ฮ"
];

const CONSONANT_TIERS = {
    common: ['ก','ข','ค','ง','จ','ฉ','ช','ซ','ด','ต','น','บ','ป','ม','ย','ร','ล','ว','ส','อ'],
    uncommon: ['ญ','ฐ','ท','ธ','พ','ฟ','ภ','ห'],
    rare: ['ฆ','ฌ','ฎ','ฏ','ฑ','ฒ','ณ','ศ','ษ'],
    legendary: ['ฃ','ฅ','ฬ','ฮ']
};

// 1. ดึงคำถามและสลับตัวเลือก (ซ่อนเฉลย)
exports.getQuestion = functions.https.onCall((data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Please login');
    const qIndex = Math.floor(Math.random() * RAW_QUIZ_DATABASE.length);
    const selectedQ = RAW_QUIZ_DATABASE[qIndex];
    let shuffledOptions = [...selectedQ.options];
    
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return { questionId: qIndex, question: selectedQ.question, options: shuffledOptions };
});

// 2. ตรวจคำตอบและให้รางวัล
exports.submitQuizAnswer = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Please login');
    const { questionId, userAnswerText } = data;
    const realQ = RAW_QUIZ_DATABASE[questionId];
    
    const isCorrect = (userAnswerText === realQ.options[realQ.answer]);
    if (isCorrect) {
        await db.collection('users').doc(context.auth.uid).update({
            gold: admin.firestore.FieldValue.increment(50),
            exp: admin.firestore.FieldValue.increment(20)
        });
        return { correct: true, goldEarned: 50 };
    }
    return { correct: false, goldEarned: 0 };
});

// 3. ระบบสุ่มกาชาและ Pity System
exports.rollGacha = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Please login');
    const playerRef = db.collection('users').doc(context.auth.uid);

    return await db.runTransaction(async (transaction) => {
        const playerDoc = await transaction.get(playerRef);
        const playerData = playerDoc.data();
        if (playerData.gold < 100) throw new functions.https.HttpsError('failed-precondition', 'Gold ไม่พอ');

        let pityCounter = (playerData.pityCounter || 0) + 1;
        let selectedTier;
        const rand = Math.random() * 100;

        if (pityCounter >= 10) {
            selectedTier = 'legendary'; pityCounter = 0;
        } else {
            if (rand <= 60) selectedTier = 'common';
            else if (rand <= 85) selectedTier = 'uncommon';
            else if (rand <= 95) selectedTier = 'rare';
            else { selectedTier = 'legendary'; pityCounter = 0; }
        }

        const tierArray = CONSONANT_TIERS[selectedTier];
        const dropChar = tierArray[Math.floor(Math.random() * tierArray.length)];
        let currentCollection = playerData.collectedConsonants || [];
        let isNew = false; let fragmentsAdded = 0;
        
        if (!currentCollection.includes(dropChar)) {
            currentCollection.push(dropChar);
            isNew = true;
        } else {
            fragmentsAdded = 10;
        }

        transaction.update(playerRef, {
            gold: admin.firestore.FieldValue.increment(-100),
            collectedConsonants: currentCollection,
            pityCounter: pityCounter,
            fragments: admin.firestore.FieldValue.increment(fragmentsAdded)
        });

        return { dropped: dropChar, tier: selectedTier, isNew, fragmentsAdded };
    });
});

// 4. แลกเศษอักษร (การันตีตัวไม่ซ้ำ)
exports.exchangeMissingConsonant = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Please login');
    const playerRef = db.collection('users').doc(context.auth.uid);

    return await db.runTransaction(async (transaction) => {
        const playerDoc = await transaction.get(playerRef);
        const fragments = playerDoc.data().fragments || 0;
        let collected = playerDoc.data().collectedConsonants || [];

        if (fragments < 100) throw new functions.https.HttpsError('failed-precondition', 'เศษอักษรไม่พอ');
        if (collected.length >= 44) throw new functions.https.HttpsError('already-exists', 'สะสมครบแล้ว!');

        const missing = ALL_CONSONANTS.filter(c => !collected.includes(c));
        const guaranteedChar = missing[Math.floor(Math.random() * missing.length)];
        collected.push(guaranteedChar);

        transaction.update(playerRef, {
            fragments: admin.firestore.FieldValue.increment(-100),
            collectedConsonants: collected
        });

        return { success: true, obtainedChar: guaranteedChar, remainingFragments: fragments - 100, isCompleted: (collected.length === 44) };
    });
});
