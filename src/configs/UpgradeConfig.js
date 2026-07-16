// ============================================================
// UpgradeConfig.js – Cau hinh nang cap (V2.4)
// Chi giu lai ky nang CO THUC su hoat dong
// ============================================================

export const UPGRADES = [
    {
        id: "hp_boost",
        labelKey: "UPG_HP_LBL",
        descKey:  "UPG_HP_DESC",
        icon: "[HP+]",
        color: "#ff3366",
        rarity: "common",
        effect: (p) => {
            p.maxHp = Math.floor(p.maxHp * 1.28);
            p.hp    = Math.min(p.hp + 50, p.maxHp);
        }
    },
    {
        id: "hp_regen",
        labelKey: "UPG_HPREGEN_LBL",
        descKey:  "UPG_HPREGEN_DESC",
        icon: "[REG]",
        color: "#ff6699",
        rarity: "rare",
        effect: (p) => {
            p.regenRate = (p.regenRate || 0) + 3;
        }
    },
    {
        id: "dmg_up",
        labelKey: "UPG_DMG_LBL",
        descKey:  "UPG_DMG_DESC",
        icon: "[ATK]",
        color: "#ffcc00",
        rarity: "common",
        effect: (p) => {
            p.damage = Math.floor(p.damage * 1.22);
        }
    },
    {
        id: "crit_up",
        labelKey: "UPG_CRIT_LBL",
        descKey:  "UPG_CRIT_DESC",
        icon: "[CRT]",
        color: "#ff8800",
        rarity: "rare",
        effect: (p) => {
            p.critChance = Math.min((p.critChance || 0) + 0.12, 0.8);
            p.critMult   = (p.critMult || 1.5) + 0.3;
        }
    },
    {
        id: "firerate_up",
        labelKey: "UPG_FIRE_LBL",
        descKey:  "UPG_FIRE_DESC",
        icon: "[FIR]",
        color: "#ff9900",
        rarity: "common",
        effect: (p) => {
            p.shootDelay = Math.max(p.shootDelay - 35, 65);
            if (p.scene) p.scene.startAutoShoot();
        }
    },
    {
        id: "spread_shot",
        labelKey: "UPG_SPREAD_LBL",
        descKey:  "UPG_SPREAD_DESC",
        icon: "[SPR]",
        color: "#cc00ff",
        rarity: "rare",
        effect: (p) => {
            p.bulletSpread = Math.min((p.bulletSpread || 0) + 1, 4);
        }
    },
    {
        id: "bullet_count",
        labelKey: "UPG_BULLET_LBL",
        descKey:  "UPG_BULLET_DESC",
        icon: "[DBL]",
        color: "#ff66cc",
        rarity: "epic",
        effect: (p) => {
            p.bulletCount = Math.min((p.bulletCount || 1) + 1, 6);
        }
    },
    {
        id: "shield",
        labelKey: "UPG_SHIELD_LBL",
        descKey:  "UPG_SHIELD_DESC",
        icon: "[SHD]",
        color: "#3399ff",
        rarity: "rare",
        effect: (p) => {
            p.grantShield();
        }
    },
    {
        id: "heal_full",
        labelKey: "UPG_HEALFULL_LBL",
        descKey:  "UPG_HEALFULL_DESC",
        icon: "[HEL]",
        color: "#00ff88",
        rarity: "epic",
        effect: (p) => {
            p.hp = p.maxHp;
        }
    },
    {
        id: "bullet_speed",
        labelKey: "UPG_BSPD_LBL",
        descKey:  "UPG_BSPD_DESC",
        icon: "[BSP]",
        color: "#00ccff",
        rarity: "common",
        effect: (p) => {
            // Tang damage them 10% va shootDelay giam nhe
            p.damage     = Math.floor(p.damage * 1.10);
            p.shootDelay = Math.max(p.shootDelay - 15, 65);
            if (p.scene) p.scene.startAutoShoot();
        }
    }
];

export function getRandomUpgrades(count = 3, excludeIds = []) {
    const pool     = UPGRADES.filter(u => !excludeIds.includes(u.id));
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}