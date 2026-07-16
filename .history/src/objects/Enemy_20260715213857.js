// ============================================================
// Enemy.js – Ke dich va Boss (V2.1 Final)
// Boss: 4 Phase, 5 ky nang, sinh quai moi 10s, hoi mau
// Boss roi do moi mat 10-15% HP
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

        // HP bar graphics (moi quai)
        this._hpBarBg   = scene.add.graphics().setDepth(12);
        this._hpBarFill = scene.add.graphics().setDepth(13);
    }

    spawn(x, y, typeKey, difficulty = 1) {
        const cfg = ENEMY_TYPES[typeKey];
        if (!cfg) return;

        this.typeKey = typeKey;
        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);

        this.setTexture(cfg.texture);
        this.setScale(cfg.scale || 1);
        this.clearTint();
        this.setAlpha(1);

        this.isBoss     = cfg.isBoss || false;
        this.score      = cfg.score || 10;
        this.maxHp      = Math.floor(cfg.hp * difficulty);
        this.hp         = this.maxHp;
        this.speedY     = cfg.speedY * (1 + (difficulty - 1) * 0.2);
        this.fireRate   = Math.max(cfg.fireRate / difficulty, 350);
        this.bulletSpeed= (cfg.bulletSpeed || 300) * (1 + (difficulty - 1) * 0.1);
        this.bulletDmg  = Math.floor((cfg.bulletDmg || 5) * difficulty);
        this.dropChance = cfg.dropChance || 0;
        this.dropTable  = cfg.dropTable || ["heal"];

        // Reset state
        this.isSummoned = false;
        this._fireTimer = Phaser.Math.Between(500, this.fireRate);
        this._patrolDir = Phaser.Math.Between(0, 1) === 0 ? 1 : -1;
        this._hasReachedPatrolY = false;
        this._isLasering = false;
        this._laserGfx = null;
        this._currentPhase = 0;

        // Boss-specific drop threshold: roi do moi mat 10% HP
        this._lastDropHpPct = 1.0;

        // Trac minion timer
        this._minionSummonTimer = 0;
        this._summonInterval = cfg.summonInterval || 10000;
        this._summonType     = cfg.summonType || "enemy2";
        this._summonCount    = cfg.summonCount || 3;
        this._minionHealPct  = cfg.minionHealPct || 0.02;
        this._activeMinionCount = 0;

        this.setVelocity(0, this.speedY);

        if (this.isBoss) {
            this.bossSkills = cfg.bossSkills || [];
            this._patrolY = 130;
            this.setVelocity(0, 120);

            this._spreadCooldown  = 2500;
            this._laserCooldown   = 6000;
            this._summonCooldown  = 9000;
            this._dashCooldown    = 7000;
            this._circleCooldown  = 5000;
            this._rageMode = false;

            this._showBossWarning(typeKey);
        }

        // Hien thi HP bar (quai thuong cung co)
        this._updateHpBar();
    }

    _showBossWarning(typeKey) {
        const isFinal = typeKey === "boss2";
        const scene = this.scene;
        const cx = scene.scale.width / 2;

        const warnText = scene.add.text(
            cx, scene.scale.height / 2,
            isFinal ? "!!! BOSS CUOI CUNG !!!" : "!!! BOSS XUAT HIEN !!!",
            {
                fontSize: isFinal ? "50px" : "42px",
                color: isFinal ? "#ff0000" : "#ff6600",
                fontStyle: "bold",
                stroke: "#000", strokeThickness: 8
            }
        ).setOrigin(0.5).setDepth(50);

        scene.tweens.add({
            targets: warnText,
            alpha: { from: 1, to: 0 },
            scaleX: { from: 1, to: 1.8 },
            scaleY: { from: 1, to: 1.8 },
            duration: 2000,
            onComplete: () => warnText.destroy()
        });

        scene.cameras.main.shake(700, 0.025);
        if (scene.audioManager) scene.audioManager.playSFX("sfx_siren");
    }

    hit(damage) {
        if (!this.active) return false;
        this.hp -= damage;
        this.setTint(0xff2200);
        this.scene.time.delayedCall(80, () => {
            if (this.active) this.clearTint();
        });

        // Update HP bar
        this._updateHpBar();

        // Boss: check phase + drop item moi mat 10-12% HP
        if (this.isBoss) {
            this._checkBossPhase();
            this._checkBossThresholdDrop();
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
            return true;
        }
        return false;
    }

    _checkBossThresholdDrop() {
        const hpPct = this.hp / this.maxHp;
        const dropped = this._lastDropHpPct - hpPct;

        // Moi khi mat them 10-12% HP thi roi do
        if (dropped >= 0.10) {
            this._lastDropHpPct = hpPct;
            this._dropBossItem();
        }
    }

    _dropBossItem() {
        const scene = this.scene;
        const dropCount = Math.random() < 0.5 ? 2 : 1;
        const types = this.dropTable || ["heal_lg", "dmg"];

        for (let i = 0; i < dropCount; i++) {
            const item = scene.items.get();
            if (item) {
                const type = types[Math.floor(Math.random() * types.length)];
                item.spawn(
                    this.x + Phaser.Math.Between(-60, 60),
                    this.y + 40,
                    type
                );
            }
        }
    }

    _checkBossPhase() {
        const hpPct = this.hp / this.maxHp;
        let newPhase = 0;
        if (hpPct <= 0.10) newPhase = 3;
        else if (hpPct <= 0.40) newPhase = 2;
        else if (hpPct <= 0.70) newPhase = 1;

        if (newPhase > this._currentPhase) {
            this._currentPhase = newPhase;
            this._onPhaseChange(newPhase);
        }
    }

    _onPhaseChange(phase) {
        const scene = this.scene;
        const cx = scene.scale.width / 2;

        scene.cameras.main.shake(400, 0.018);
        this.setTint(0xff0000);
        scene.time.delayedCall(300, () => { if (this.active) this.clearTint(); });

        const labels = ["", "PHASE 2 – ENRAGED", "PHASE 3 – BERSERK", "RAGE – FINAL STAND"];
        const colors = ["", "#ff8800", "#ff4400", "#ff0000"];

        if (phase > 0) {
            const txt = scene.add.text(cx, 85, labels[phase], {
                fontSize: "26px", color: colors[phase], fontStyle: "bold",
                stroke: "#000", strokeThickness: 6
            }).setOrigin(0.5).setDepth(50);

            scene.tweens.add({
                targets: txt, alpha: 0, y: txt.y - 50, duration: 2200,
                onComplete: () => txt.destroy()
            });
        }

        if (phase === 3) {
            this._rageMode = true;
            this._spreadCooldown  = 1000;
            this._laserCooldown   = 2500;
            this._summonCooldown  = 4000;
            this._circleCooldown  = 2000;
            this._dashCooldown    = 4000;
        } else if (phase === 2) {
            this._spreadCooldown  = 1600;
            this._laserCooldown   = 4000;
            this._summonCooldown  = 6000;
            this._circleCooldown  = 3500;
        } else if (phase === 1) {
            if (!this.bossSkills.includes("circle")) {
                this.bossSkills.push("circle");
            }
        }
    }

    _updateHpBar() {
        if (!this.active) {
            this._hpBarBg.clear();
            this._hpBarFill.clear();
            return;
        }

        const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
        const w = this.isBoss ? 120 : 40;
        const h = this.isBoss ? 10 : 5;
        const bx = this.x - w / 2;
        const by = this.y - this.displayHeight / 2 - (this.isBoss ? 20 : 10);

        this._hpBarBg.clear();
        this._hpBarBg.fillStyle(0x220000, 0.85);
        this._hpBarBg.fillRect(bx, by, w, h);

        this._hpBarFill.clear();
        const color = pct > 0.5 ? 0x00ff55 : pct > 0.25 ? 0xffcc00 : 0xff2200;
        this._hpBarFill.fillStyle(color, 1);
        this._hpBarFill.fillRect(bx, by, w * pct, h);
    }

    die() {
        this._isLasering = false;
        if (this._laserGfx) { this._laserGfx.destroy(); this._laserGfx = null; }
        this._hpBarBg.clear();
        this._hpBarFill.clear();
        this.disableBody(true, true);
    }

    // ─── Boss Skills ───────────────────────────────────────────────

    fireSpread() {
        const count = this._rageMode ? 14 : (this._currentPhase >= 1 ? 10 : 7);
        const spreadAngle = this._rageMode ? 140 : 100;
        const startAngle = 90 - spreadAngle / 2;
        const step = spreadAngle / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = startAngle + i * step;
            const b = this.scene.enemyBullets.get();
            if (b) b.fireAngled(this.x, this.y + 40, this.bulletDmg, angle, this.bulletSpeed * 1.2);
        }
    }

    fireCircle() {
        const count = this._rageMode ? 24 : 16;
        for (let i = 0; i < count; i++) {
            const angle = (360 / count) * i;
            const b = this.scene.enemyBullets.get();
            if (b) b.fireAngled(this.x, this.y, this.bulletDmg * 0.6, angle, this.bulletSpeed * 0.85);
        }
    }

    fireLaser() {
        if (this._isLasering) return;
        this._isLasering = true;

        const scene = this.scene;
        const warnLine = scene.add.graphics().setDepth(8);
        warnLine.lineStyle(3, 0xff0000, 0.45);
        warnLine.lineBetween(this.x, this.y, this.x, scene.scale.height);

        scene.time.delayedCall(900, () => {
            warnLine.destroy();
            if (!this.active) { this._isLasering = false; return; }

            if (!this._laserGfx) this._laserGfx = scene.add.graphics();
            this._laserGfx.clear();
            this._laserGfx.lineStyle(28, 0xff0000, 0.9);
            this._laserGfx.lineBetween(this.x, this.y + 50, this.x, scene.scale.height);
            this._laserGfx.lineStyle(10, 0xffffff, 0.7);
            this._laserGfx.lineBetween(this.x, this.y + 50, this.x, scene.scale.height);
            this._laserGfx.setDepth(9);

            if (scene.audioManager) scene.audioManager.playSFX("sfx_shoot");

            scene.time.delayedCall(700, () => {
                if (this._laserGfx) this._laserGfx.clear();
                this._isLasering = false;
            });
        });
    }

    doDash() {
        const scene = this.scene;
        const targetX = scene.player ? scene.player.x : scene.scale.width / 2;
        const dir = targetX > this.x ? 1 : -1;
        this.setVelocityX(1000 * dir);
        scene.time.delayedCall(220, () => {
            if (this.active) {
                this.setVelocityX(this.speedY * this._patrolDir);
                this.fireSpread();
            }
        });
    }

    summonMinions() {
        const scene = this.scene;
        const count = this._rageMode ? (this._summonCount + 3) : this._summonCount;
        
        scene.events.emit("boss-summon-tracked", {
            boss: this, count, type: this._summonType
        });

        // Canh bao text
        const txt = scene.add.text(this.x, this.y - 70, "MINIONS!", {
            fontSize: "22px", color: "#ffcc00", fontStyle: "bold",
            stroke: "#000", strokeThickness: 4
        }).setOrigin(0.5).setDepth(50);
        scene.tweens.add({
            targets: txt, y: txt.y - 30, alpha: 0, duration: 1200,
            onComplete: () => txt.destroy()
        });
    }

    getLaserX() { return this.x; }

    // ─── Update ────────────────────────────────────────────────────

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) return;

        const { width, height } = this.scene.scale;

        if (this.isBoss) {
            // Di chuyen boss vao patrol position
            if (!this._hasReachedPatrolY) {
                if (this.y >= this._patrolY) {
                    this._hasReachedPatrolY = true;
                    this.y = this._patrolY;
                    this.setVelocity(this.speedY * this._patrolDir, 0);
                }
            } else {
                // Patrol trai-phai
                if (this.x <= 60) {
                    this._patrolDir = 1;
                    this.setVelocityX(this.speedY);
                } else if (this.x >= width - 60) {
                    this._patrolDir = -1;
                    this.setVelocityX(-this.speedY);
                }

                // Spread Shot
                if (this.bossSkills.includes("spread")) {
                    this._spreadCooldown -= delta;
                    if (this._spreadCooldown <= 0) {
                        this.fireSpread();
                        this._spreadCooldown = Phaser.Math.Between(1800, 3500);
                    }
                }
                // Laser
                if (this.bossSkills.includes("laser")) {
                    this._laserCooldown -= delta;
                    if (this._laserCooldown <= 0) {
                        this.fireLaser();
                        this._laserCooldown = Phaser.Math.Between(4500, 8000);
                    }
                }
                // Circle Shot
                if (this.bossSkills.includes("circle")) {
                    this._circleCooldown -= delta;
                    if (this._circleCooldown <= 0) {
                        this.fireCircle();
                        this._circleCooldown = Phaser.Math.Between(3000, 6000);
                    }
                }
                // Dash
                if (this.bossSkills.includes("dash")) {
                    this._dashCooldown -= delta;
                    if (this._dashCooldown <= 0) {
                        this.doDash();
                        this._dashCooldown = Phaser.Math.Between(5000, 9000);
                    }
                }
                // Summon Minions moi summonInterval ms
                this._minionSummonTimer += delta;
                if (this._minionSummonTimer >= this._summonInterval) {
                    this._minionSummonTimer = 0;
                    this.summonMinions();
                }

                // Update laser GFX khi boss di chuyen
                if (this._isLasering && this._laserGfx) {
                    this._laserGfx.clear();
                    this._laserGfx.lineStyle(28, 0xff0000, 0.9);
                    this._laserGfx.lineBetween(this.x, this.y + 50, this.x, height);
                    this._laserGfx.lineStyle(10, 0xffffff, 0.7);
                    this._laserGfx.lineBetween(this.x, this.y + 50, this.x, height);
                }
            }

            // Update HP bar (vi boss di chuyen)
            this._updateHpBar();

        } else {
            // Quan thuong ban dan
            this._fireTimer -= delta;
            if (this._fireTimer <= 0) {
                this._fireTimer = this.fireRate;
                const b = this.scene.enemyBullets.get();
                if (b) b.fire(this.x, this.y + 20, this.bulletDmg, this.bulletSpeed);
            }

            // Update HP bar
            this._updateHpBar();

            // Tu huy khi ra khoi man hinh
            if (this.y > height + 50) {
                this._hpBarBg.clear();
                this._hpBarFill.clear();
                this.disableBody(true, true);
                this.scene.events.emit("enemy-escaped", this);
            }
        }
    }
}