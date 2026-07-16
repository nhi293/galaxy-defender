// ============================================================
// EnemyConfig.js – Cau hinh Quai va Boss (V2.5)
// Tang HP quai nho manh hon – cam giac chien dau lau hon
// ============================================================

export const ENEMY_TYPES = {
    enemy1: {
        texture: "enemy1", hp: 90,  speedY: 68,  score: 10,
        dropChance: 0.12, dropTable: ["heal"],
        fireRate: 2600, bulletSpeed: 200, bulletDmg: 7, scale: 1
    },
    enemy2: {
        texture: "enemy2", hp: 160, speedY: 78,  score: 20,
        dropChance: 0.15, dropTable: ["heal", "dmg"],
        fireRate: 2200, bulletSpeed: 220, bulletDmg: 12, scale: 1.1
    },
    enemy3: {
        texture: "enemy3", hp: 260, speedY: 88,  score: 35,
        dropChance: 0.18, dropTable: ["heal", "dmg", "rapid"],
        fireRate: 1900, bulletSpeed: 250, bulletDmg: 16, scale: 1.2
    },
    enemy4: {
        texture: "enemy4", hp: 420, speedY: 95,  score: 55,
        dropChance: 0.22, dropTable: ["heal", "dmg", "rapid", "shield"],
        fireRate: 1600, bulletSpeed: 280, bulletDmg: 22, scale: 1.35
    },
    enemy5: {
        texture: "enemy5", hp: 680, speedY: 105, score: 90,
        dropChance: 0.28, dropTable: ["heal_lg", "dmg", "rapid", "shield", "spread"],
        fireRate: 1300, bulletSpeed: 310, bulletDmg: 30, scale: 1.5
    },

    // ─── Boss 1 – Stage 1-4 ───────────────────────────────────
    boss1: {
        isBoss:   true,
        texture:  "boss1",
        hp:       13000,
        speedY:   55,
        score:    1500,
        fireRate: 1000,
        bulletSpeed: 320,
        bulletDmg:   32,
        scale: 4,
        dropChance: 1.0,
        dropTable: ["heal_lg", "dmg", "shield", "rapid", "spread", "multi"],
        bossSkills: ["spread", "dash"],
        summonInterval: 10000,
        summonType:  "enemy2",
        summonCount: 3,
        minionHealPct: 0.02
    },

    // ─── Boss Tutorial – Yeu hon boss1 ───────────────────────
    bossTutorial: {
        isBoss:   true,
        texture:  "boss1",
        hp:       5000,
        speedY:   45,
        score:    500,
        fireRate: 2000,
        bulletSpeed: 200,
        bulletDmg:   12,
        scale: 2.5,
        dropChance: 1.0,
        dropTable: ["heal_lg", "dmg", "shield"],
        bossSkills: ["spread"],
        summonInterval: 99999,   // Khong sinh quai trong tutorial
        summonType: "enemy1",
        summonCount: 0,
        minionHealPct: 0
    },

    // ─── Boss 2 – Final Boss Stage 5 (Sieu trau) ────────────
    boss2: {
        isBoss:   true,
        texture:  "boss2",
        hp:       80000,
        speedY:   65,
        score:    10000,
        fireRate: 650,
        bulletSpeed: 420,
        bulletDmg:   55,
        scale: 5.5,
        dropChance: 1.0,
        dropTable: ["heal_lg", "heal_lg", "dmg", "shield", "spread", "multi"],
        bossSkills: ["spread", "laser", "summon", "dash", "circle"],
        summonInterval: 22000,
        summonType:  "enemy3",
        summonCount: 3,
        minionHealPct: 0.03
    }
};