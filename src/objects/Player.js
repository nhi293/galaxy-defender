// ============================================================
// Player.js – Tau nguoi choi (V2.3)
// Nho hon, moi stage them 1 tia dan, di chuyen theo chuot
// ============================================================
import Phaser from "phaser";
import { UPGRADES } from "../configs/UpgradeConfig";

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(20);
        this.setCollideWorldBounds(true);

        // Nho lai – scale 0.55 thay vi 0.8-1.0 truoc do
        this.setScale(0.55);

        const stageId = scene.stageId ?? 1;
        this._applyStageStats(stageId);

        this.isAlive     = true;
        this.hasShield   = false;
        this.acquiredSkills = [];

        this._shieldGfx   = scene.add.graphics().setDepth(19);
        this._thrusterGfx = scene.add.graphics().setDepth(18);
        this._regenAccum  = 0;
        this._invincible  = false;
    }

    // ─── Stats theo stage ────────────────────────────────────
    _applyStageStats(stageId) {
        const base = {
            0: { damage: 18,  maxHp: 120, shootDelay: 310, moveSpeed: 320 },
            1: { damage: 24,  maxHp: 140, shootDelay: 295, moveSpeed: 325 },
            2: { damage: 34,  maxHp: 165, shootDelay: 275, moveSpeed: 330 },
            3: { damage: 46,  maxHp: 195, shootDelay: 255, moveSpeed: 335 },
            4: { damage: 60,  maxHp: 230, shootDelay: 235, moveSpeed: 340 },
            5: { damage: 78,  maxHp: 265, shootDelay: 210, moveSpeed: 350 }
        };
        const s = base[stageId] ?? base[1];
        this.damage     = s.damage;
        this.maxHp      = s.maxHp;
        this.hp         = this.maxHp;
        this.shootDelay = s.shootDelay;
        this.moveSpeed  = s.moveSpeed;

        // Moi stage them 1 tia dan chinh
        // Stage 0 (tutorial): 1 tia, Stage 1: 2 tia, Stage 2: 3 tia, ...
        this.bulletCount  = Math.min(stageId + 1, 5);   // toi da 5 tia
        this.bulletSpread = 0;   // so cap dan toa (nang cap)
        this.critChance   = 0;
        this.critMult     = 1.5;
        this.piercing     = false;
        this.hasLaser     = false;
        this.droneCount   = 0;
        this.regenRate    = 0;
    }

    // ─── Damage ──────────────────────────────────────────────
    takeDamage(amount) {
        if (!this.isAlive || this._invincible) return false;

        if (this.hasShield) {
            this.hasShield = false;
            this._shieldGfx.clear();
            this.scene.cameras.main.flash(100, 0, 150, 255, 0.5);
            return false;
        }

        this.hp -= amount;
        this._invincible = true;
        this.scene.time.delayedCall(280, () => { this._invincible = false; });

        // Nhap nhay bao hieu bi an
        this.setTint(0xff2200);
        this.scene.time.delayedCall(150, () => { if (this.active) this.clearTint(); });

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
            return true;
        }
        return false;
    }

    heal(amount) {
        if (!this.isAlive) return;
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    grantShield() {
        this.hasShield = true;
    }

    // ─── Upgrade ─────────────────────────────────────────────
    applyUpgrade(upgradeId) {
        const upg = UPGRADES.find(u => u.id === upgradeId);
        if (upg?.effect) {
            upg.effect(this);
            this.acquiredSkills.push({ icon: upg.icon, color: upg.color });
        }
    }

    // ─── Die ─────────────────────────────────────────────────
    die() {
        this.isAlive = false;
        this.setVisible(false);
        this.disableBody(true, true);
        this._shieldGfx.clear();
        this._thrusterGfx.clear();
    }

    // ─── Shoot ───────────────────────────────────────────────
    shoot() {
        if (!this.isAlive) return;

        const scene = this.scene;
        const getDmg = () => {
            let d = this.damage;
            if (this.critChance > 0 && Math.random() < this.critChance) {
                d = Math.floor(d * (this.critMult || 1.5));
            }
            return d;
        };

        // Dan song song theo bulletCount
        const lanes   = Math.max(1, this.bulletCount);
        const spacing = 14;

        for (let i = 0; i < lanes; i++) {
            const offsetX = (i - (lanes - 1) / 2) * spacing;
            const b = scene.playerBullets.get();
            if (b) b.fire(this.x + offsetX, this.y - 24, getDmg(), -550);
        }

        // Dan toa (spread upgrade)
        if (this.bulletSpread > 0) {
            const sv = Math.min(this.bulletSpread, 4);
            for (let i = 1; i <= sv; i++) {
                const bL = scene.playerBullets.get();
                if (bL) bL.fireAngled(this.x, this.y - 20, getDmg() * 0.75, -90 - i * 20, 520);
                const bR = scene.playerBullets.get();
                if (bR) bR.fireAngled(this.x, this.y - 20, getDmg() * 0.75, -90 + i * 20, 520);
            }
        }

        try { scene.audioManager.playSFX("sfx_shoot"); } catch(e) {}
    }

    // ─── Update ──────────────────────────────────────────────
    update(delta) {
        if (!this.isAlive) return;

        // Shield glow
        this._shieldGfx.clear();
        if (this.hasShield) {
            const r = 30 + Math.sin(Date.now() * 0.005) * 4;
            this._shieldGfx.lineStyle(3, 0x00ffff, 0.95);
            this._shieldGfx.strokeCircle(this.x, this.y, r);
            this._shieldGfx.lineStyle(1, 0x0099ff, 0.35);
            this._shieldGfx.strokeCircle(this.x, this.y, r + 10);
        }

        // Dong co phun lua
        this._thrusterGfx.clear();
        const fh = 10 + Math.random() * 16;
        this._thrusterGfx.fillStyle(0xff5500, 0.85);
        this._thrusterGfx.fillTriangle(this.x - 7, this.y + 14, this.x + 7, this.y + 14, this.x, this.y + 14 + fh);
        this._thrusterGfx.fillStyle(0xffcc00, 0.6);
        this._thrusterGfx.fillTriangle(this.x - 3, this.y + 14, this.x + 3, this.y + 14, this.x, this.y + 14 + fh * 0.6);

        // HP Regen
        if (this.regenRate > 0 && this.hp < this.maxHp) {
            this._regenAccum += this.regenRate * (delta / 1000);
            if (this._regenAccum >= 1) {
                const r = Math.floor(this._regenAccum);
                this._regenAccum -= r;
                this.heal(r);
            }
        }
    }
}
