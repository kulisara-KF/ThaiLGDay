const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ฐานข้อมูลคำถาม (ใส่เพิ่มได้เลย)
const RAW_QUIZ_DATABASE = [
   { question: 'ระบบเสียงในภาษาไทยแบ่งออกเป็นกี่หน่วย', options: ['3', '2', '1', '4'], answer: 0 },
            { question: 'วันภาษาไทยแห่งชาติคือ', options: ['29 กรกฎาคม', '30 เมษายน', '5 มีนาคม', '1 สิงหาคม'], answer: 0 },
            { question: 'คำใดออกเสียงวรรณยุกต์ ตรี', options: ['ฟ้า', 'การ', 'บ้าน', 'ค่ะ'], answer: 0 },
            { question: 'คำในข้อใดเขียนได้ถูกต้อง', options: ['เจ๊ง', 'โน๊ต', 'คุ๊กกี้', 'แว๊น'], answer: 0 },
            { question: 'ข้อใดเป็นอักษรควบไม่แท้', options: ['ทราย', 'กราบ', 'คล้าย', 'ขวาน'], answer: 0 },
            { question: 'ข้อใดเป็นสรรพนามบุรุษที่ 3', options: ['มัน', 'ฉัน', 'แก', 'กู'], answer: 0 },
            { question: 'คำไวพจน์ในข้อใดไม่ใช่สัตว์', options: ['อัคคี', 'กุญชร', 'วิหค', 'กาสร'], answer: 0 },
            { question: 'ข้อใดคือคำไวพจน์ของดวงอาทิตย์', options: ['สุริยัน', 'แข', 'ศศิ', 'เดือน'], answer: 0 },
            { question: 'สำนวนไทยในข้อใดมีความหมายแตกต่างจากข้ออื่น', options: ['หาเหาใส่หัว', 'ไก่ได้พลอย', 'ตาบอดได้แว่น', 'หัวล้านได้หวี'], answer: 0 },
            { question: 'ข้อใดคือคำประสม', options: ['ขวดนม', 'บุกรุก', 'บ้านเรือน', 'จิตใจ'], answer: 0 },
            { question: 'ข้อใดคือคำซ้อน', options: ['ทิ้งขว้าง', 'ปอดแหก', 'ไส้แห้ง', 'เหยี่ยวข่าว'], answer: 0 },
            { question: 'คำในข้อใดถูกต้อง', options: ['น้ำแข็งไส', 'ตาบลอด', 'ปิดศนา', 'ปราบปาม'], answer: 0 },
            { question: 'ข้อใดเขียนผิด', options: ['เฟสบุ๊ค', 'ฟุตบอล', 'วอลเลย์บอล', 'ปิงปอง'], answer: 0 },
            { question: 'Facebook เขียนทับศัพท์ว่าอย่างไร', options: ['เฟซบุ๊ก', 'เฟสบุ๊ก', 'เฟสบุค', 'เฟสบุ๊ค'], answer: 0 },
            { question: 'คำใดเขียนผิด', options: ['กระทิ', 'กระทะ', 'กระทง', 'กระบวย'], answer: 0 },
            { question: 'คำใดเขียนผิด', options: ['เพิ่มพูล', 'พรรคพวก', 'พอเพียง', 'พลัดพราก'], answer: 0 },
            { question: 'มณฑป อ่านว่าอย่างไร', options: ['มน-ดบ', 'มะ-นะ-ทบ', 'มน-นะ-ทบ', 'มัน-ดบ'], answer: 0 },
            { question: 'อะไรเอ่ย ตอนเด็กสีขาว สาว ๆ สีเขียว ตอนแก่สีแดง', options: ['พริก', 'ลำไย', 'ทุเรียน', 'กะเพรา'], answer: 0 },
            { question: 'อะไรเอ่ยเกิดมาเป็นคู่อยู่ใกล้ ๆ แต่ไม่เคยเห็นกัน', options: ['หู', 'มือ', 'เท้า', 'ปาก'], answer: 0 },
            { question: 'อะไรเอ่ยไม่ใหญ่ไม่กว้างแต่บังโลกมิดติดอยู่กับตัวคน', options: ['เปลือกตา', 'เท้า', 'เสื้อ', 'รองเท้า'], answer: 0 },
            { question: 'อะไรเอ่ยทุกคนต้องมีทุกคนต้องลืม', options: ['ตา', 'ปาก', 'คอ', 'จมูก'], answer: 0 },
            { question: 'คำใดเขียนผิด', options: ['กระเพรา', 'กระเพาะ', 'ไพเราะ', 'เพราะอะไร'], answer: 0 },
            { question: '“จะหักอื่นขืนหักก็จักได้ หักอาลัยนี้ไม่หลุดสุดจะหัก สารพัดตัดขาดประหลาดนัก แต่ตัดรักนี้ไม่ขาดประหลาดใจ” จากกลอนข้างต้น สุนทรภู่กล่าวว่าสิ่งใดเป็นสิ่งที่ตัดไม่ขาด', options: ['เขา', 'รัก', 'เรียน', 'อดีต'], answer: 1 },
            { question: 'ลูกของพระอภัยมณีกับนางผีเสื้อสมุทรมีชื่อว่าอะไร', options: ['สินสมุทร','นางเงือก', 'สุดสาคร', 'นนทก'], answer: 0 },
            { question: 'นนทกตายแล้วมาเกิดเป็นใคร', options: ['ทศกัณฐ์', 'พิเภก', 'พระราม', 'มัจฉานุ'], answer: 0 },
            { question: 'พระอภัยมณีใช้เครื่องดนตรีใด', options: ['ปี่', 'กีตาร์', 'ขลุ่ย', 'ซอ'], answer: 0 },
            { question: 'ม้านิลมังกรเป็นเพศใด', options: ['กะเทย', 'เมีย', 'ผู้', 'ทอม'], answer: 0 },
            { question: 'ข้อใดเขียนผิด', options: ['กระเทย', 'ตะกละ', 'ตบะ', 'สมถะ'], answer: 0 },
            { question: 'คำว่า "พลานุกูล" ในชื่อโรงเรียนพระพุทธบาท "พลานุกูลวิทยา" เกิดจากการสร้างคำแบบใด', options: ['สมาส', 'ประสม', 'ซ้ำ', 'ซ้อน'], answer: 0 },
            { question: 'คำว่า "พลานุกูล" ในชื่อโรงเรียนพระพุทธบาท "พลานุกูลวิทยา" เกิดจากการนำคำคู่ใดสมาสกัน', options: ['พล + อนุกูล', 'พล- + นุกูล', 'พละ + อนุกูล', 'พลานุ + กูล'], answer: 0 },
            { question: 'สุนทรภู่เสียชีวิตในสมัยรัชกาลใด', options: ['รัชกาลที่ ๔', 'รัชกาลที่ ๒', 'รัชกาลที่ ๓', 'รัชกาลที่ ๕'], answer: 0 },
            { question: 'นิราศพระบาทเป็นผลงานของใคร', options: ['สุนทรภู่', 'กุลิสรา', 'พุทธชาติ', 'พระบาทสมเด็จพระพุทธเลิศหล้านภาลัย'], answer: 0 },
            { question: 'อำเภอพระพุทธบาทอยู่ในจังหวัดใด', options: ['สระบุรี', 'อยุธยา', 'ลพบุรี', 'บ้านหมอ'], answer: 0 },
            { question: 'พระรามจากเรื่องรามเกียรติ์คือเทพองค์ใดอวตาร', options: ['พระนารายณ์', 'พระอินทร์', 'พระศิวะ', 'พระอิศวร'], answer: 0 },
            { question: 'ข้อใดไม่มีคำผิด', options: ['ครูครับ สวัสดีครับ', 'คูครับ สวัดดีครับ', 'ครูค่ะ สวัสดีคะ', 'คูค่ะ สวัสดีค่ะ'], answer: 0 },
            { question: 'ไตรยางศ์คืออะไร?', options: ['อักษรสามหมู่ อักษรสูง อักษรกลาง อักษรต่ำ', 'อักษรสี่หมู่ อักษรสูง อักษรกลาง อักษรต่ำเดี่ยว อักษรต่ำคู่', 'อักษรสองหมู่ อักษรสูง อักษรกลาง', 'อักษรห้าหมู่ อักษรสูง อักษรกลาง อักษรต่ำเดี่ยว อักษรต่ำคู่ อักษรสามัญ'], answer: 0 },
            { question: 'วันภาษาไทยแห่งชาติตรงกับวันที่ ๒๙ กรกฎาคม เนื่องจากเหตุการณ์สำคัญอันยิ่งใหญ่ใดในปี พ.ศ. ๒๕๐๕?', options: ['พระบาทสมเด็จพระเจ้าอยู่หัว รัชกาลที่ ๙ เสด็จฯ ร่วมอภิปรายเรื่องปัญหาการใช้คำไทย ณ จุฬาลงกรณ์มหาวิทยาลัย', 'มีการจัดพิมพ์ตำราอักษรศาสตร์ไทยเล่มแรกของชาติอย่างเป็นทางการ', 'การประกาศใช้จารึกพยัญชนะไทยแบบสุโขทัยอย่างเป็นแบบแผน', 'การลงนามสัญญานานาชาติว่าด้วยการศึกษาร่วมอักษรตะวันออก'], answer: 0 },
            { question: 'คำว่า ทักษ์ ใน "พิทักษ์" สะกดตามมาตราตัวสะกดในข้อใดจึงถูกต้องตามทฤษฎีอักษรศาสตร์โบราณ?', options: ['มาตรา แม่ กก (สะกดด้วยพยัญชนะวรรค ก.ไก่)', 'มาตรา แม่ กด (สะกดด้วยพยัญชนะวรรค ด.เด็ก)', 'มาตรา แม่ กบ (สะกดด้วยพยัญชนะวรรค บ.ใบไม้)', 'มาตรา แม่ กน (สะกดด้วยพยัญชนะวรรค น.หนู)'], answer: 1 },
            { question: 'พยัญชนะไทยชุดใดต่อไปนี้ จัดอยู่ในหมวดหมู่อักษรสามหมู่กลุ่ม "อักษรสูง" ทั้งสิ้น?', options: ['ข, ฉ, ถ, ผ, ศ, ห', 'ก, จ, ด, ต, บ, ป', 'ค, ง, ช, ซ, ท, น', 'ร, ล, ว, ม, ย, ณ'], answer: 0 },
            { question: 'พยัญชนะภาษาไทยลำดับที่ ๔๔ ตัวสุดท้ายคือข้อใด และเป็นอักษรหมู่ใดในไตรยางศ์?', options: ['ฮ. นกฮูก (อักษรต่ำเดี่ยว)', 'อ. อ่าง (อักษรกลางคู่)', 'ฬ. จุฬา (อักษรสูงเดี่ยว)', 'ฑ. มณโฑ (อักษรต่ำคู่)'], answer: 0 }
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
