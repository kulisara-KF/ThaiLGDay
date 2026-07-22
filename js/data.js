// ==================== GAME DATA ====================

const THAI_CONSONANTS = [
    "ก", "ข", "ฃ", "ค", "ฅ", "ฆ", "ง", "จ", "ฉ", "ช", "ซ", "ฌ", "ญ", "ฎ", "ฏ", 
    "ฐ", "ฑ", "ฒ", "ณ", "ด", "ต", "ถ", "ท", "ธ", "น", "บ", "ป", "ผ", "ฝ", "พ", 
    "ฟ", "ภ", "ม", "ย", "ร", "ล", "ว", "ศ", "ษ", "ส", "ห", "ฬ", "อ", "ฮ"
];

const GAME_CHARACTERS = [
    {
        id: "khunphaen",
        name: "ขุนแผน",
        title: "จอมเวทเจ้าเสน่ห์",
        rarity: "Epic",
        baseAtk: 90,
        baseDef: 65,
        baseSpeed: 85,
        desc: "เปี่ยมด้วยเวทมนตร์คาถา สามารถกำราบศัตรูด้วยพลังอาคม",
        maxStatCap: 195
    },
    {
        id: 'hanuman',
        name: 'หนุมานชาญสมร',
        title: 'วานรเหินหาว',
        rarity: 'Legendary',
        baseAtk: 100,
        baseDef: 70,
        baseSpeed: 120,
        desc: "เปี่ยมด้วยเวทมนตร์คาถา สามารถกำราบศัตรูด้วยพลังอาคม",
        maxStatCap: 200
    },
    {
        id: 'inao',
        name: 'อิเหนา',
        title: 'รูปหล่อพ่อรวย',
        rarity: 'Rare',
        baseAtk: 85,
        baseDef:85,
        baseSpeed: 85,
        desc: 'เกราะป้องกันและพลังโจมตีกริชสมดุลรอบด้าน',
        maxStatCap: 170
    },
    {
        id: "aphai",
        name: "พระอภัยมณี",
        title: "จอมเวทเสียงพิณ",
        avatar: "🪈",
        rarity: "Epic",
        baseAtk: 85,
        baseDef: 60,
        baseSpeed: 80,
        desc: "ใช้เสียงปี่บรรเลงสะกดศัตรูให้ตกอยู่ในภวังค์และสร้างจังหวะได้ดีเยี่ยม",
        maxStatCap: 190
    },
    {
        id: 'sudsakorn',
        name: 'สุดสาครกับม้านิลมังกร',
        title: 'อัศวินน้อยกับพาหนะวิเศษ',
        rarity: 'Rare',
         rarity: "Rare",
        baseAtk: 75,
        baseDef: 75,
        baseSpeed: 95,
        desc: "ผู้คล่องแคล่วว่องไว เดินทางข้ามมหาสมุทรด้วยไม้วิเศษและพาหนะคู่ใจ",
        maxStatCap: 180
     },
    {
        id: 'sugriva',
        name: 'สุครีพพญาวานร',
        title: 'สุริยบุตรผู้เกรียงไกร',
        rarity: "Rare",
        baseAtk: 80,
        baseDef: 75,
        baseSpeed: 90,
        desc: "สมดุลทั้งการโจมตีและการป้องกัน",
        maxStatCap: 180
     },
    {
        id: 'phi_suea',
        name: 'นางผีเสื้อสมุทร',
        title: 'อสูรกายแห่งท้องทะเล',
        rarity: 'Epic',
        baseAtk: 100,
        baseDef: 75,
        baseSpeed: 65,
        desc: "พลังโจมตีรุนแรงมหาศาล",
        maxStatCap: 185
    },
      {
        id: "wessuwan",
        name: "ท้าวเวสสุวรรณ",
        title: "อธิบดีแห่งอสูร",
        rarity: "Godlike",
        baseAtk: 250,
        baseDef: 250,
        baseSpeed: 200,
        desc: "ผู้สยบภูตผี มีพลังเกรียงไกรที่สุดในแดนดิน จะปลดล็อกเมื่อสะสมพยัญชนะไทยครบ 44 ตัวเท่านั้น!",
        isLocked: true,
        unlockRequirement: 44
    }
    ];
// รายการคำถามต้นฉบับ
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
    { question: 'ลูกของพระอภัยมณีกับนางผีเสื้อสมุทรมีชื่อว่าอะไร', options: ['สินสมุทร', 'นางเงือก', 'สุดสาคร', 'นนทก'], answer: 0 },
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
    { question: 'วันภาษาไทยแห่งชาติตรงกับวันที่ ๒๙ กรกฎาคม เนื่องจากเหตุการณ์สำคัญอันยิ่งใหญ่ใดในปี พ.ศ. ๒๕٠๕?', options: ['พระบาทสมเด็จพระเจ้าอยู่หัว รัชกาลที่ ๙ เสด็จฯ ร่วมอภิปรายเรื่องปัญหาการใช้คำไทย ณ จุฬาลงกรณ์มหาวิทยาลัย', 'มีการจัดพิมพ์ตำราอักษรศาสตร์ไทยเล่มแรกของชาติอย่างเป็นทางการ', 'การประกาศใช้จารึกพยัญชนะไทยแบบสุโขทัยอย่างเป็นแบบแผน', 'การลงนามสัญญานานาชาติว่าด้วยการศึกษาร่วมอักษรตะวันออก'], answer: 0 },
    { question: 'คำว่า ทักษ์ ใน "พิทักษ์" สะกดตามมาตราตัวสะกดในข้อใดจึงถูกต้องตามทฤษฎีอักษรศาสตร์โบราณ?', options: ['มาตรา แม่ กก (สะกดด้วยพยัญชนะวรรค ก.ไก่)', 'มาตรา แม่ กด (สะกดด้วยพยัญชนะวรรค ด.เด็ก)', 'มาตรา แม่ กบ (สะกดด้วยพยัญชนะวรรค บ.ใบไม้)', 'มาตรา แม่ กน (สะกดด้วยพยัญชนะวรรค น.หนู)'], answer: 1 },
    { question: 'พยัญชนะไทยชุดใดต่อไปนี้ จัดอยู่ในหมวดหมู่อักษรสามหมู่กลุ่ม "อักษรสูง" ทั้งสิ้น?', options: ['ข, ฉ, ถ, ผ, ศ, ห', 'ก, จ, ด, ต, บ, ป', 'ค, ง, ช, ซ, ท, น', 'ร, ล, ว, ม, ย, ณ'], answer: 0 },
    { question: 'พยัญชนะภาษาไทยลำดับที่ ๔๔ ตัวสุดท้ายคือข้อใด และเป็นอักษรหมู่ใดในไตรยางศ์?', options: ['ฮ. นกฮูก (อักษรต่ำเดี่ยว)', 'อ. อ่าง (อักษรกลางคู่)', 'ฬ. จุฬา (อักษรสูงเดี่ยว)', 'ฑ. มณโฑ (อักษรต่ำคู่)'], answer: 0 },
    { question: "พยัญชนะไทยมีทั้งหมดกี่ตัว?", options: ["42 ตัว", "44 ตัว", "46 ตัว", "48 ตัว"], answer: 1 },
    { question: "อักษรสามหมู่ (ไตรยางศ์) แบ่งออกเป็นกี่ระดับ?", options: ["2 ระดับ", "3 ระดับ", "4 ระดับ", "5 ระดับ"], answer: 1 },
    { question: "พยัญชนะตัวแรกของภาษาไทยคือตัวใด?", options: ["ก", "ข", "ค", "ง"], answer: 0 },
    { question: "พยัญชนะ 'ก' จัดอยู่ในอักษรหมู่ใด?", options: ["อักษรสูง", "อักษรกลาง", "อักษรต่ำคู่", "อักษรต่ำเดี่ยว"], answer: 1 },
    { question: "พยัญชนะตัวสุดท้ายของภาษาไทยคือตัวใด?", options: ["อ", "ฬ", "ฮ", "ศ"], answer: 2 }
];

// ฟังก์ชันสุ่มสลับตัวเลือก (Fisher-Yates Shuffle) และอัปเดตดัชนีเฉลยแบบไดนามิก
function generateShuffledQuizDatabase(quizList) {
    return quizList.map(item => {
        const correctAnswerText = item.options[item.answer];
        
        // สลับตำแหน่งตัวเลือก
        const shuffledOptions = [...item.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        // ค้นหาตำแหน่ง Index ใหม่ของคำตอบที่ถูกต้อง
        const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);
        
        return {
            ...item,
            options: shuffledOptions,
            answer: newAnswerIndex
        };
    });
}

// สร้าง QUIZ_DATABASE ที่ตัวเลือกถูกสุ่มตำแหน่งแล้วโดยอัตโนมัติ
const QUIZ_DATABASE = generateShuffledQuizDatabase(RAW_QUIZ_DATABASE);

// ผูกตัวแปรทั้งสองชื่อเข้าด้วยกัน
const quizzes = QUIZ_DATABASE;

function getRequiredExp(level) {
    return level * 100;
}

// Global Export & Compatibility สำหรับเกมทุกเวอร์ชัน
if (typeof window !== 'undefined') {
    window.THAI_CONSONANTS = THAI_CONSONANTS;
    window.GAME_CHARACTERS = GAME_CHARACTERS;
    window.QUIZ_DATABASE = QUIZ_DATABASE;
    window.quizzes = quizzes;
    window.getRequiredExp = getRequiredExp;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        THAI_CONSONANTS,
        GAME_CHARACTERS,
        QUIZ_DATABASE,
        quizzes,
        getRequiredExp
    };
}
// ==================== POWER CARDS DATA ====================
const POWER_CARDS = [
    {
        id: "card_attack",
        name: "ดาบทะลวง",
        type: "offensive",
        manaCost: 2,
        desc: "โจมตีศัตรูด้วยความรุนแรง 150% ของค่า ATK",
        effect: (player, enemy) => { enemy.hp -= (player.atk * 1.5) - enemy.def; }
    },
    {
        id: "card_shield",
        name: "โล่เพชร",
        type: "defensive",
        manaCost: 1,
        desc: "ลดความเสียหายจากการโจมตีครั้งต่อไป 50%",
        effect: (player, enemy) => { player.shieldActive = true; }
    },
    {
        id: "card_heal",
        name: "โอสถทิพย์",
        type: "support",
        manaCost: 2,
        desc: "ฟื้นฟู HP 30% ของ Max HP",
        effect: (player, enemy) => { player.hp = Math.min(player.maxHp, player.hp + (player.maxHp * 0.3)); }
    },
    {
        id: "card_hint",
        name: "ตาทิพย์",
        type: "utility",
        manaCost: 1,
        desc: "ตัดตัวเลือกที่ผิดออก 2 ข้อในคำถามถัดไป",
        effect: (player, enemy) => { player.hintActive = true; }
    }
];
