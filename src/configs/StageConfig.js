// ============================================================
// StageConfig.js – Cau hinh Stage (V2.0 Final)
// Stage 0 = Tutorial (boss yeu, luon 3 sao)
// Stage 5 = Boss cuoi khong co quan thuong
// ============================================================

export const STAGES = {
    0: {
        name: "TUTORIAL",
        baseBgm: "bgm_tutorial",
        waves: [
            { count: 8,  type: "enemy1", spawnInterval: 1800 },
            { count: 1,  type: "bossTutorial", isBoss: true }
        ]
    },
    1: {
        name: "STAGE 1",
        baseBgm: "bgm_stage1",
        waves: [
            { count: 30, type: "enemy1", spawnInterval: 1400 },
            { count: 40, type: "enemy2", spawnInterval: 1200 },
            { count: 1,  type: "boss1",  isBoss: true }
        ]
    },
    2: {
        name: "STAGE 2",
        baseBgm: "bgm_stage2",
        waves: [
            { count: 40, type: "enemy2", spawnInterval: 1200 },
            { count: 50, type: "enemy3", spawnInterval: 1000 },
            { count: 1, type: "boss1", isBoss: true }
        ]
    },
    3: {
        name: "STAGE 3",
        baseBgm: "bgm_stage3",
        waves: [
            { count: 55, type: "enemy3", spawnInterval: 1000 },
            { count: 65, type: "enemy4", spawnInterval: 800 },
            { count: 1, type: "boss1", isBoss: true }
        ]
    },
    4: {
        name: "STAGE 4",
        baseBgm: "bgm_stage4",
        waves: [
            { count: 70, type: "enemy4", spawnInterval: 800 },
            { count: 85, type: "enemy5", spawnInterval: 650 },
            { count: 1, type: "boss1", isBoss: true }
        ]
    },
    5: {
        name: "FINAL BOSS",
        baseBgm: "bgm_boss",
        waves: [
            { count: 1, type: "boss2", isBoss: true }
        ]
    }
};

export function calcStars(hpPct, timeSec, stageId) {
    // Tutorial (stageId 0 hoac "tutorial") luon nhan 3 sao
    if (stageId === 0 || stageId === "tutorial") return 3;

    // Cac stage khac: tinh theo HP con lai
    if (hpPct >= 0.75) return 3;
    if (hpPct >= 0.40) return 2;
    return 1;
}
