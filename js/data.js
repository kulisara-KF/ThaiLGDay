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

const QUIZ_DATABASE = [
    {
        question: "พยัญชนะไทยมีทั้งหมดกี่ตัว?",
        options: ["42 ตัว", "44 ตัว", "46 ตัว", "48 ตัว"],
        answer: 1
    },
    {
        question: "อักษรสามหมู่ (ไตรยางศ์) แบ่งออกเป็นกี่ระดับ?",
        options: ["2 ระดับ", "3 ระดับ", "4 ระดับ", "5 ระดับ"],
        answer: 1
    },
    {
        question: "พยัญชนะตัวแรกของภาษาไทยคือตัวใด?",
        options: ["ก", "ข", "ค", "ง"],
        answer: 0
    },
    {
        question: "พยัญชนะ 'ก' จัดอยู่ในอักษรหมู่ใด?",
        options: ["อักษรสูง", "อักษรกลาง", "อักษรต่ำคู่", "อักษรต่ำเดี่ยว"],
        answer: 1
    },
    {
        question: "พยัญชนะตัวสุดท้ายของภาษาไทยคือตัวใด?",
        options: ["อ", "ฬ", "ฮ", "ศ"],
        answer: 2
    }
];

function getRequiredExp(level) {
    return level * 100;
}
