// ============================================================
// SaveManager.js – Quản lý lưu trữ local
// ============================================================

const SAVE_KEY = "GALAXY_DEFENDER_SAVE";

const DEFAULT_DATA = {
    unlockedStage: "tutorial",
    stageStars: {},     // { "tutorial": 3, 1: 2, 2: 0 ... }
    history: [],        // { stageId, score, timeSec, enemiesKilled, date }
    settings: {
        musicVolume: 0.7,
        sfxVolume: 1.0,
        language: "vi"
    }
};

class SaveManagerClass {

    constructor() {
        this._data = null;
    }

    // Đọc data từ localStorage
    getData() {
        if (this._data) return this._data;

        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            try {
                this._data = JSON.parse(raw);
                // Merge với default lỡ thiếu field
                this._data.settings = { ...DEFAULT_DATA.settings, ...this._data.settings };
                this._data.stageStars = { ...DEFAULT_DATA.stageStars, ...this._data.stageStars };
                this._data.history = this._data.history || [];
            } catch (e) {
                console.warn("Save file corrupted, using default");
                this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
        } else {
            this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        return this._data;
    }

    // Ghi xuống localStorage
    _save() {
        if (!this._data) return;
        localStorage.setItem(SAVE_KEY, JSON.stringify(this._data));
    }

    updateSettings(newSettings) {
        const d = this.getData();
        d.settings = { ...d.settings, ...newSettings };
        this._save();
    }

    saveVictory(result) {
        const d = this.getData();
        let { stageId, stars, score, timeSec, enemiesKilled } = result;

        // Chuan hoa: "tutorial" -> 0, cac so khac giu nguyen
        if (stageId === "tutorial") stageId = 0;

        // Luu stars neu cao hon
        const cur = d.stageStars[stageId] ?? 0;
        if (stars > cur) d.stageStars[stageId] = stars;

        // Mo khoa man tiep theo
        const order = [0, 1, 2, 3, 4, 5];
        const idx   = order.indexOf(stageId);
        if (idx >= 0 && idx < order.length - 1) {
            const next    = order[idx + 1];
            const curUnl  = d.unlockedStage === "tutorial" ? 0 : (d.unlockedStage ?? 0);
            if (next > curUnl) d.unlockedStage = next;
        }

        d.history.push({ stageId, score, timeSec, enemiesKilled, result: "VICTORY", date: Date.now() });
        this._save();
    }

    saveGameOver(result) {
        const d = this.getData();
        const { stageId, score, timeSec, enemiesKilled } = result;

        d.history.push({
            stageId, score, timeSec, enemiesKilled, result: "GAME_OVER", date: Date.now()
        });

        this._save();
    }

    resetAll() {
        this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this._save();
    }
}

const SaveManager = new SaveManagerClass();
export default SaveManager;