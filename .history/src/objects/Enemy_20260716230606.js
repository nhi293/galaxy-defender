// ============================================================
// Enemy.js – Ke dich va Boss (V2.3 – Fixed pool + HP bar)
// ============================================================
import Phaser from "phaser";
import { ENEMY_TYPES } from "../configs/EnemyConfig";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "enemy1");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(10);
        this.disableBody(true, true);

        // HP bar – khoi tao o day nhung chi ve khi active
        this._hpBarBg   = scene.add.graphics().setDepth(12);
        this._hpBarFill = scene.add.graphics().setDepth(13);
        this._hpBarBg.setVisible(false);
        this._hpBarFill.setVisible(false);
    }

    // ─────────────────────────────────────────────────────────
    spawn(x, y, typeKey, difficulty = 1) {
        const cfg = ENEMY_TYPES[typeKey];
        if (!cfg) {
            console.warn("[Enemy] Unknown typeKey:", typeKey);
            return;
        }

        this.typeKey   = typeKey;
        this.isBoss    = !!cfg.isBoss;
        this.score     = cfg.score  || 10;
        this.dropChance= cfg.dropChance || 0;
        this.dropTable = cfg.dropTable  || ["heal"];

        // Scaling theo difficulty
        this.maxHp       = Math.floor((cfg.hp || 50) * difficulty);
        this.hp          = this.maxHp;
        this.speedY      = (cfg.speedY || 80) * (1 + (difficulty - 1) * 0.15);
        this.fireRate    = Math.max((cfg.fireRate || 2000) / difficulty, 300);
        this.bulletSpeed = (cfg.bulletSpeed || 280) * (1 + (difficulty - 1) * 0.08);
        this.bulletDmg   = Math.floor((cfg.bulletDmg || 8)  * difficulty);

        // Reset common
        this.isSummoned            = false;
        this._summonBoss           = null;
        this._fireTimer            = Phaser.Math.Between(600, this.fireRate);
        this._patrolDir            = Math.random() < 0.5 ? 1 : -1;
        this._hasReachedPatrolY    = false;
        this._isLasering           = false;
        this._currentPhase         = 0;
        this._rageMode             = false;
        this._lastDropHpPct        = 1.0;
        this._dropThreshold        = Phaser.Math.FloatBetween(0.10, 0.15);
        this._minionSummonTimer    = 0;
        this._summonInterval       = cfg.summonInterval || 10000;
        this._summonType           = cfg.summonType     || "enemy2";
        this._summonCount          = cfg.summonCount    || 3;
        this._minionHealPct        = cfg.minionHealPct  || 0.02;

        // Texture & appearance
        const tex = cfg.texture || "enemy1";
        const safeTexture = this.scene.textures.exists(tex) ? tex : "enemy1";
        this.setTexture(safeTexture);
        this.setScale(cfg.scale || 1);
        this.clearTint();
        this.setAlpha(1);

        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);
        this.setVelocity(0, this.speedY);

        // Boss extra setup
        if (this.isBoss) {
            this.bossSkills      = [...(cfg.bossSkills || [])];
            this._patrolY        = 120;
            this._laserDmg       = Math.floor(this.bulletDmg * 1.5);
            this._spreadCooldown = 2800;
            this._laserCooldown  = 7000;
            this._circleCooldown = 5500;
            this._dashCooldown   = 8000;
            this._laserGfx       = null;
            this._emergencySummonUsed = false;
            this.setVelocity(0, 110);
            this._showBossWarning();
        }

        // HP bar hien thi
        this._hpBarBg.setVisible(true);
        this._hpBarFill.setVisible(true);
        this._updateHpBar();
    }

    // ─── Boss Warning ─────────────────────────────────────────
    _showBossWarning() {
        if (!this.scene?.cameras?.main) return;
        const scene = this.scene;
        const cx = scene.scale.width  / 2;
        const cy = scene.scale.height / 2;

        const msg  = this.typeKey === "boss2" ? "!!! BOSS CUOI CUNG !!!" : "!!! BOSS XUAT HIEN !!!";
        const clr  = this.typeKey === "boss2" ? "#ff0000" : "#ff6600";
        const size = this.typeKey === "boss2" ? "46px"    : "38px";

        const txt = scene.add.text(cx, cy, msg, {
            fontSize: size, color: clr, fontStyle: "bold",
            stroke: "#000", strokeThickness: 8
        }).setOrigin(0.5).setDepth(50);

        scene.tweens.add({
            targets: txt,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 1.6 },
            duration: 1800,
            onComplete: () => txt.destroy()
        });

        scene.cameras.main.shake(600, 0.022);
        if (scene.audioManager) {
            try { scene.audioManager.playSFX("sfx_siren"); } catch(e) {}
        }
    }

    // ─── HP Bar ───────────────────────────────────────────────
    _updateHpBar() {
        if (!this.active || !this._hpBarBg) return;

        const pct  = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
        const w    = this.isBoss ? 110 : 36;
        const h    = this.isBoss ? 9   : 4;
        const bx   = this.x - w / 2;
        const by   = this.y - this.displayHeight * 0.5 - (this.isBoss ? 18 : 8);

        this._hpBarBg.clear();
        this._hpBarBg.fillStyle(0x220000, 0.85);
        this._hpBarBg.fillRect(bx, by, w, h);

        this._hpBarFill.clear();
        const col = pct > 0.5 ? 0x00ff55 : pct > 0.25 ? 0xffcc00 : 0xff2200;
        this._hpBarFill.fillStyle(col, 1);
        this._hpBarFill.fillRect(bx, by, w * pct, h);
    }

    _hideHpBar() {
        if (this._hpBarBg)   { this._hpBarBg.clear();   this._hpBarBg.setVisible(false);   }
        if (this._hpBarFill) { this._hpBarFill.clear();  this._hpBarFill.setVisible(false); }
    }

    // ─── Hit ─────────────────────────────────────────────────
    hit(damage) {
        if (!this.active) return false;

        this.hp -= damage;
        this.setTint(0xff2200);
        this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });
        this._updateHpBar();

        if (this.isBoss) {
            this._checkPhase();
            this._checkThresholdDrop();
            this._checkEmergencySummon();
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
            return true;
        }
        return false;
    }

    // ─── Boss Phase ───────────────────────────────────────────
    _checkPhase() {
        const pct = this.hp / this.maxHp;
        const newP = pct <= 0.10 ? 3 : pct <= 0.40 ? 2 : pct <= 0.70 ? 1 : 0;
        if (newP <= this._currentPhase) return;

        this._currentPhase = newP;
        this.scene.cameras.main.shake(350, 0.015);
        this.setTint(0xff0000);
        this.scene.time.delayedCall(280, () => { if (this.active) this.clearTint(); });

        const msgs  = ["", "PHASE 2 – ENRAGED", "PHASE 3 – BERSERK", "RAGE – FINAL STAND"];
        const cols  = ["", "#ff8800",            "#ff4400",           "#ff0000"];
        if (newP > 0) {
            const cx = this.scene.scale.width / 2;
            const t  = this.scene.add.text(cx, 80, msgs[newP], {
                fontSize: "24px", color: cols[newP], fontStyle: "bold",
                stroke: "#000", strokeThickness: 6
            }).setOrigin(0.5).setDepth(50);
            this.scene.tweens.add({ targets: t, alpha: 0, y: t.y - 50, duration: 2000, onComplete: () => t.destroy() });
        }

        if (newP === 3) {
            this._rageMode       = true;
            this._spreadCooldown = 900;
            this._laserCooldown  = 2200;
            this._circleCooldown = 1800;
            this._dashCooldown   = 3500;
        } else if (newP === 2) {
            this._spreadCooldown = 1500;
            this._laserCooldown  = 3800;
            this._circleCooldown = 3200;
        } else if (newP === 1) {
            if (!this.bossSkills.includes("circle")) this.bossSkills.push("circle");
        }
    }

    // ─── Boss Threshold Drop ──────────────────────────────────
    _checkThresholdDrop() {
        const pct    = this.hp / this.maxHp;
        const dropped= this._lastDropHpPct - pct;
        if (dropped >= this._dropThreshold) {
            this._lastDropHpPct  = pct;
            this._dropThreshold  = Phaser.Math.FloatBetween(0.10, 0.15);
            this._doBossDrop();
        }
    }

    _checkEmergencySummon() {
    if (this._emergencySummonUsed) return;
    if (!this._summonCount || this._summonCount <= 0) return; // bossTutorial khong co
    const pct = this.hp / this.maxHp;
    if (pct <= 0.5) {
        this._emergencySummonUsed = true;
        this._minionSummonTimer = 0; // tranh trung voi dot trieu hoi dinh ky ngay sau
        this._summonMinions(true);
    }
}

    _doBossDrop() {
        const scene = this.scene;
        if (!scene?.items) return;
        const count = Phaser.Math.Between(1, 2);
        const table = this.dropTable || ["heal_lg", "dmg"];
        for (let i = 0; i < count; i++) {
            const it = scene.items.get();
            if (it) it.spawn(this.x + Phaser.Math.Between(-60, 60), this.y + 50, table[Math.floor(Math.random() * table.length)]);
        }
    }

    // ─── Boss Skills ─────────────────────────────────────────
    _fireSpread() {
        const count  = this._rageMode ? 14 : (this._currentPhase >= 1 ? 10 : 7);
        const span   = this._rageMode ? 140 : 100;
        const step   = span / (count - 1);
        const start  = 90 - span / 2;
        for (let i = 0; i < count; i++) {
            const b = this.scene.enemyBullets.get();
            if (b) b.fireAngled(this.x, this.y + 30, this.bulletDmg, start + i * step, this.bulletSpeed * 1.15);
        }
    }

    _fireCircle() {
        const count = this._rageMode ? 24 : 16;
        for (let i = 0; i < count; i++) {
            const b = this.scene.enemyBullets.get();
            if (b) b.fireAngled(this.x, this.y, this.bulletDmg * 0.6, (360 / count) * i, this.bulletSpeed * 0.85);
        }
    }

    _fireLaser() {
        if (this._isLasering) return;
        this._isLasering = true;
        const scene = this.scene;

        // Canh bao tia do mong
        const warn = scene.add.graphics().setDepth(8);
        warn.lineStyle(3, 0xff0000, 0.4);
        warn.lineBetween(this.x, this.y, this.x, scene.scale.height);

        scene.time.delayedCall(800, () => {
            warn.destroy();
            if (!this.active || !this._isLasering) { this._isLasering = false; return; }

            if (!this._laserGfx) this._laserGfx = scene.add.graphics();
            const draw = () => {
                if (!this._laserGfx) return;
                this._laserGfx.clear().setDepth(9);
                this._laserGfx.lineStyle(26, 0xff0000, 0.92).lineBetween(this.x, this.y + 40, this.x, scene.scale.height);
                this._laserGfx.lineStyle(10, 0xffffff, 0.7).lineBetween(this.x, this.y + 40, this.x, scene.scale.height);
            };
            draw();

            scene.time.delayedCall(700, () => {
                if (this._laserGfx) { this._laserGfx.destroy(); this._laserGfx = null; }
                this._isLasering = false;
            });
        });
    }

    _doDash() {
        const target = this.scene.player;
        if (!target) return;
        const dir = target.x > this.x ? 1 : -1;
        this.setVelocityX(950 * dir);
        this.scene.time.delayedCall(200, () => {
            if (this.active) {
                this.setVelocityX(this.speedY * this._patrolDir);
                this._fireSpread();
            }
        });
    }

    _summonMinions() {
        const scene = this.scene;
        if (!scene?.events) return;
        scene.events.emit("boss-summon-tracked", {
            boss: this, count: this._rageMode ? this._summonCount + 3 : this._summonCount,
            type: this._summonType
        });
    }

    getLaserX() { return this.x; }

    // ─── Die ─────────────────────────────────────────────────
    die() {
        this._isLasering = false;
        if (this._laserGfx) { this._laserGfx.destroy(); this._laserGfx = null; }
        this._hideHpBar();
        this.disableBody(true, true);
    }

    // ─── preUpdate ───────────────────────────────────────────
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) return;

        const { width, height } = this.scene.scale;

        if (this.isBoss) {
            if (!this._hasReachedPatrolY) {
                if (this.y >= this._patrolY) {
                    this._hasReachedPatrolY = true;
                    this.y = this._patrolY;
                    this.setVelocity(this.speedY * this._patrolDir, 0);
                }
            } else {
                // Patrol
                if (this.x <= 55) { this._patrolDir = 1;  this.setVelocityX( this.speedY); }
                if (this.x >= width - 55) { this._patrolDir = -1; this.setVelocityX(-this.speedY); }

                // Cooldown skills
                if (this.bossSkills.includes("spread")) {
                    this._spreadCooldown -= delta;
                    if (this._spreadCooldown <= 0) { this._fireSpread(); this._spreadCooldown = Phaser.Math.Between(1600, 3500); }
                }
                if (this.bossSkills.includes("laser")) {
                    this._laserCooldown -= delta;
                    if (this._laserCooldown <= 0) { this._fireLaser(); this._laserCooldown = Phaser.Math.Between(4000, 8000); }
                }
                if (this.bossSkills.includes("circle")) {
                    this._circleCooldown -= delta;
                    if (this._circleCooldown <= 0) { this._fireCircle(); this._circleCooldown = Phaser.Math.Between(2800, 6000); }
                }
                if (this.bossSkills.includes("dash")) {
                    this._dashCooldown -= delta;
                    if (this._dashCooldown <= 0) { this._doDash(); this._dashCooldown = Phaser.Math.Between(5000, 9000); }
                }

                // Summon minions
                this._minionSummonTimer += delta;
                if (this._minionSummonTimer >= this._summonInterval) {
                    this._minionSummonTimer = 0;
                    this._summonMinions();
                }

                // Update laser GFX theo vi tri boss
                if (this._isLasering && this._laserGfx) {
                    this._laserGfx.clear().setDepth(9);
                    this._laserGfx.lineStyle(26, 0xff0000, 0.92).lineBetween(this.x, this.y + 40, this.x, height);
                    this._laserGfx.lineStyle(10, 0xffffff, 0.7).lineBetween(this.x, this.y + 40, this.x, height);
                }
            }
            this._updateHpBar();

        } else {
            // Quan thuong: ban xuong va tu huy khi ra khoi man hinh
            this._fireTimer -= delta;
            if (this._fireTimer <= 0) {
                this._fireTimer = Phaser.Math.Between(this.fireRate * 0.7, this.fireRate * 1.3);
                const b = this.scene.enemyBullets.get();
                if (b) b.fire(this.x, this.y + 20, this.bulletDmg, this.bulletSpeed);
            }

            this._updateHpBar();

            if (this.y > height + 60) {
                this._hideHpBar();
                this.disableBody(true, true);
                this.scene.events.emit("enemy-escaped", this);
            }
        }
    }
}