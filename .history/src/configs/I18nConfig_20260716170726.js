// ============================================================
// I18nConfig.js – Hỗ trợ đa ngôn ngữ (vi, en)
// ============================================================
import SaveManager from "../managers/SaveManager";

export const TRANSLATIONS = {
    vi: {
        PLAY: "BẮT ĐẦU",
        PROFILE: "HỒ SƠ",
        SETTINGS: "CÀI ĐẶT",
        EXIT: "THOÁT",
        MUSIC_VOL: "NHẠC NỀN",
        SFX_VOL: "HIỆU ỨNG",
        LANGUAGE: "NGÔN NGỮ",
        SELECT_STAGE: "CHỌN MÀN CHƠI",
        STAGE: "MÀN",
        BOSS: "TRÙM",
        WARNING: "CẢNH BÁO!",
        SUMMON: "TRIỆU HỒI!",
        VICTORY: "CHIẾN THẮNG!",
        GAME_OVER: "THẤT BẠI",
        WAVE: "ĐỢT",
        SCORE: "ĐIỂM",
        PAUSED: "TẠM DỪNG",
        RESUME: "TIẾP TỤC",
        MAIN_MENU: "TRANG CHỦ",
        LEVEL_UP: "NÂNG CẤP",
        RESET_DATA: "XÓA DỮ LIỆU",
        BACK: "QUAY LẠI",
        SKIP: "BỎ QUA",
        CHOOSE_ABILITY: "Chọn 1 kỹ năng để nâng cấp:",
        LOCKED: "ĐÃ KHÓA",
        SURVIVED_WAVE: "SỐNG SÓT ĐẾN ĐỢT",
        TIME: "THỜI GIAN",
        RANK: "HẠNG",
        TOTAL_SCORE: "Tổng Điểm",
        ENEMIES_KILLED: "Kẻ Địch Đã Tiêu Diệt",
        PLAY_TIME: "Thời Gian Chơi",
        TOTAL_STARS: "Tổng Số Sao",
        REPLAY: "CHƠI LẠI",
        MENU: "MENU",
        RETRY: "THỬ LẠI",
        
        TUTORIAL_INSTR: "DI CHUYỂN & BẮN ĐỂ TIÊU DIỆT ĐỊCH!\nTiêu diệt 3 kẻ địch để hoàn thành.",
        
        TUT_STEP_1: "GIỮ VÀ DI CHUYỂN ĐỂ LÁI TÀU",
        TUT_STEP_2: "TÀU SẼ TỰ ĐỘNG BẮN",
        TUT_STEP_3: "NHẶT VẬT PHẨM ĐỂ TĂNG SỨC MẠNH",
        TUT_STEP_4: "NÉ ĐẠN CỦA ĐỊCH NHÉ!",

        UPG_HP_LBL: "TANG MAU TOI DA",
        UPG_HP_DESC: "Tang 25% Mau Toi Da va hoi mau",
        UPG_HPREGEN_LBL: "HOI MAU TU DONG",
        UPG_HPREGEN_DESC: "Tu dong hoi 2 mau moi giay",
        UPG_DMG_LBL: "TANG SAT THUONG",
        UPG_DMG_DESC: "Tang 20% sat thuong dan co ban",
        UPG_CRIT_LBL: "CHI MANG (CRIT)",
        UPG_CRIT_DESC: "Tang 10% ty le chi mang, chi mang gay them 25% dame",
        UPG_SPD_LBL: "TANG TOC CHAY",
        UPG_SPD_DESC: "Tau di chuyen nhanh hon",
        UPG_FIRE_LBL: "TANG TOC BAN",
        UPG_FIRE_DESC: "Giam thoi gian nap dan (ban nhanh hon)",
        UPG_SPREAD_LBL: "DAN TOA (SPREAD)",
        UPG_SPREAD_DESC: "Them 1 tia dan ban phu toa ra xung quanh",
        UPG_SHIELD_LBL: "KHIEN NANG LUONG",
        UPG_SHIELD_DESC: "Hap thu 1 don chiet nguon sang tiep theo",
        UPG_BULLET_LBL: "THEM DAN (DOUBLE)",
        UPG_BULLET_DESC: "Ban them 1 tia dan song song",
        UPG_HEALFULL_LBL: "HOI PHUC TOAN BO",
        UPG_HEALFULL_DESC: "Hoi phuc toan bo mau ngay lap tuc",
        UPG_BSPD_LBL: "DAN XUYEN NHANH",
        UPG_BSPD_DESC: "Tang sat thuong +10% va toc do ban nhe"
    },
    en: {
        PLAY: "PLAY",
        PROFILE: "PROFILE",
        SETTINGS: "SETTINGS",
        EXIT: "EXIT",
        MUSIC_VOL: "MUSIC VOL",
        SFX_VOL: "SFX VOL",
        LANGUAGE: "LANGUAGE",
        SELECT_STAGE: "SELECT STAGE",
        STAGE: "STAGE",
        BOSS: "BOSS",
        WARNING: "WARNING!",
        SUMMON: "SUMMON!",
        VICTORY: "VICTORY!",
        GAME_OVER: "GAME OVER",
        WAVE: "WAVE",
        SCORE: "SCORE",
        PAUSED: "PAUSED",
        RESUME: "RESUME",
        MAIN_MENU: "MAIN MENU",
        LEVEL_UP: "LEVEL UP",
        RESET_DATA: "RESET DATA",
        BACK: "BACK",
        SKIP: "SKIP",
        CHOOSE_ABILITY: "Choose one ability to enhance your ship:",
        LOCKED: "LOCKED",
        SURVIVED_WAVE: "SURVIVED WAVE",
        TIME: "TIME",
        RANK: "RANK",
        TOTAL_SCORE: "Total Score",
        ENEMIES_KILLED: "Enemies Defeated",
        PLAY_TIME: "Play Time",
        TOTAL_STARS: "Total Stars",
        REPLAY: "REPLAY",
        MENU: "MENU",
        RETRY: "RETRY",

        TUTORIAL_INSTR: "MOVE & SHOOT TO DESTROY ENEMIES!\nDestroy 3 enemies to finish.",

        TUT_STEP_1: "HOLD AND DRAG TO MOVE",
        TUT_STEP_2: "SHIP FIRES AUTOMATICALLY",
        TUT_STEP_3: "COLLECT ITEMS TO UPGRADE",
        TUT_STEP_4: "DODGE ENEMY BULLETS!",

        UPG_HP_LBL: "MAX HP UP",
        UPG_HP_DESC: "Increase Max HP by 25% and Heal",
        UPG_HPREGEN_LBL: "HP REGEN",
        UPG_HPREGEN_DESC: "Regenerate 2 HP per second",
        UPG_DMG_LBL: "DAMAGE UP",
        UPG_DMG_DESC: "Increase base damage by 20%",
        UPG_CRIT_LBL: "CRITICAL HIT",
        UPG_CRIT_DESC: "+10% crit chance, crits deal +25% extra",
        UPG_SPD_LBL: "SPEED UP",
        UPG_SPD_DESC: "Ship moves much faster",
        UPG_FIRE_LBL: "FIRE RATE UP",
        UPG_FIRE_DESC: "Decrease reload time (shoot faster)",
        UPG_SPREAD_LBL: "SPREAD SHOT",
        UPG_SPREAD_DESC: "Add 1 extra bullet spreading out",
        UPG_SHIELD_LBL: "ENERGY SHIELD",
        UPG_SHIELD_DESC: "Absorb the next source of damage",
        UPG_BULLET_LBL: "DOUBLE SHOT",
        UPG_BULLET_DESC: "Fire 1 additional parallel bullet",
        UPG_HEALFULL_LBL: "FULL RESTORE",
        UPG_HEALFULL_DESC: "Instantly restore all HP",
        UPG_BSPD_LBL: "RAPID FIRE",
        UPG_BSPD_DESC: "Increase damage +10% and fire speed"
    }
};

class I18nManager {
    constructor() {
        this._lang = "vi";
    }
    
    init() {
        const data = SaveManager.getData();
        if (data && data.settings && data.settings.language) {
            this._lang = data.settings.language;
        }
    }

    setLang(lang) {
        if (TRANSLATIONS[lang]) {
            this._lang = lang;
        }
    }

    get(key) {
        return TRANSLATIONS[this._lang][key] || key;
    }
}

const I18n = new I18nManager();
export default I18n;