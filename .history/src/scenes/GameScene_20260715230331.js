// ============================================================
// GameScene.js – Màn chơi chính (V2.0 - Responsive Core)
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import Player from "../objects/Player";
import Bullet from "../objects/Bullet";
import Enemy from "../objects/Enemy";
import EnemyBullet from "../objects/EnemyBullet";
import Item from "../objects/Item";
import Explosion from "../objects/Explosion";
import ParallaxManager from "../objects/ParallaxManager";
import I18n from "../configs/I18nConfig";

import WaveManager from "../managers/WaveManager";
import UIManager from "../managers/UIManager";
import SaveManager from "../managers/SaveManager";
import AudioManager from "../managers/AudioManager";
import { STAGES, calcStars } from "../configs/StageConfig";
import { getDifficulty } from "../configs/DifficultyConfig";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.GAME);
    }

    init(data) {
        this.stageId = data.stageId ?? 1;
        this.stageCfg = STAGES[this.stageId];
    }

    create() {
        // --- 1. Responsive Core Setup ---
        const width = this.scale.width;
        const height = this.scale.height;
        this.physics.world.setBounds(0, 0, width, height);

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(500);

        // Core systems
        this.audioManager = new AudioManager(this);
        this.audioManager.playBGM(this.stageCfg.baseBgm || "bgm_stage1");

        // Background - dung dung bg theo stage
        const bgMap = { 0: "bg_tutorial", 1: "bg_stage1", 2: "bg_stage2", 3: "bg_stage3", 4: "bg_stage3", 5: "bg_stage2" };
        const bgKey = bgMap[this.stageId] || "bg_stage1";
        const bgExists = this.textures.exists(bgKey);
        this.parallaxMgr = new ParallaxManager(this, bgExists ? bgKey : "bg_stage1");

        // Groups (tang pool cho V2.0)
        this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 120, runChildUpdate: true });
        this.enemies       = this.physics.add.group({ classType: Enemy, maxSize: 200, runChildUpdate: true });
        this.enemyBullets  = this.physics.add.group({ classType: EnemyBullet, maxSize: 400, runChildUpdate: true });
        this.items         = this.physics.add.group({ classType: Item, maxSize: 30, runChildUpdate: true });
        this.explosions    = this.add.group({ classType: Explosion, maxSize: 40, runChildUpdate: true });

        // Player
        const cx = width / 2;
        this.player = new Player(this, cx, height - 80);
        
        // Điều khiển trên điện thoại (Relative Drag)
        this.isDragging = false;
        this.input.on("pointerdown", (ptr) => {
            this.isDragging = true;
            this.dragStartX = ptr.x;
            this.dragStartY = ptr.y;
            this.playerStartX = this.player.x;
            this.playerStartY = this.player.y;
        });

        this.input.on("pointermove", (ptr) => {
            if (this.isDragging && this.player.isAlive && !this.paused) {
                const dx = ptr.x - this.dragStartX;
                const dy = ptr.y - this.dragStartY;
                const cw = this.scale.width;
                const ch = this.scale.height;
                this.player.x = Phaser.Math.Clamp(this.playerStartX + dx, 20, cw - 20);
                this.player.y = Phaser.Math.Clamp(this.playerStartY + dy, 40, ch - 40);
            }
        });

        this.input.on("pointerup", () => {
            this.isDragging = false;
        });
        
        // Auto Shoot
        this.startAutoShoot();

        // UI
        this.ui = new UIManager(this);

        // State
        this.score = 0;
        this.playTimeSec = 0;
        this.paused = false;
        
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => { if (!this.paused) this.playTimeSec++; }
        });

        // Collisions
        this.physics.add.overlap(this.playerBullets, this.enemies, this._onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this._onBulletHitPlayer, null, this);
        this.physics.add.overlap(this.enemies, this.player, this._onEnemyHitPlayer, null, this);
        this.physics.add.overlap(this.items, this.player, this._onPlayerCollectItem, null, this);

        // Events
        this.events.on("player-fire-rate-changed", () => {
            this.startAutoShoot();
        });

        // Boss summon co theo doi minion de boss hoi mau
        this._trackedMinions = new Set();

        this.events.on("boss-summon-tracked", (data) => {
            const warnText = this.add.text(data.boss.x, data.boss.y - 60, "!! " + I18n.get("SUMMON") + " !!", {
                fontFamily: GAME.FONT,
                fontSize: "24px",
                color: "#ffcc00",
                stroke: "#000",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(20);

            this.tweens.add({
                targets: warnText, y: warnText.y - 30, alpha: 0, duration: 1500,
                onComplete: () => warnText.destroy()
            });

            for (let i = 0; i < data.count; i++) {
                const e = this.enemies.get();
                if (e) {
                    e.spawn(
                        data.boss.x + Phaser.Math.Between(-70, 70),
                        data.boss.y + 30,
                        data.type, this.waveMgr.difficulty
                    );
                    e.isSummoned = true;
                    e._summonBoss = data.boss;   // reference de boss hoi mau
                    this._trackedMinions.add(e);
                }
            }
        });

      //  this.events.on("wave-started", (data) => this.ui.updateWave(data.wave, data.isBoss));
        this.events.on("wave-cleared", (data) => this._onWaveCleared(data));
        this.events.on("enemy-escaped", (enemy) => {
            if (enemy && enemy.isSummoned) {
                // Minion tron thoat → boss hoi mau theo %
                if (enemy._summonBoss && enemy._summonBoss.active) {
                    const boss = enemy._summonBoss;
                    const healAmt = Math.floor(boss.maxHp * (boss._minionHealPct || 0.02));
                    boss.hp = Math.min(boss.maxHp, boss.hp + healAmt);
                    boss._updateHpBar();
                    // Text hoi mau
                    const htxt = this.add.text(boss.x, boss.y - 40, "+" + healAmt + " HP", {
                        fontSize: "18px", color: "#00ff88", fontStyle: "bold",
                        stroke: "#000", strokeThickness: 3
                    }).setOrigin(0.5).setDepth(50);
                    this.tweens.add({ targets: htxt, y: htxt.y - 40, alpha: 0, duration: 1000, onComplete: () => htxt.destroy() });
                }
                this._trackedMinions.delete(enemy);
            } else if (enemy) {
                this.waveMgr.onEnemyEscaped();
            }
        });

        this.events.on("wave-started", (data) => {
            this.ui.updateWave(data.wave, data.isBoss);

            // Người chơi mạnh lên dần theo wave, giống quái
            if (data.wave > 1 && this.player.isAlive) {
                this.player.maxHp = Math.floor(this.player.maxHp * 1.03);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.floor(this.player.maxHp * 0.05));
                this.player.damage = Math.floor(this.player.damage * 1.03);
            }
        });

        this.events.on("all-waves-cleared", () => this._onVictory());

        // Bắt đầu Wave
        this.difficulty = getDifficulty(this.stageId);
        this.waveMgr = new WaveManager(this, this.stageCfg?.waves || [], this.difficulty);
        
        this.time.delayedCall(1000, () => this.waveMgr.startNextWave());

        // Lắng nghe sự kiện resize của Scale Manager
        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        // Cập nhật lại giới hạn vật lý
        this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
        
        // Đảm bảo player không bị lọt ra ngoài màn hình
        if (this.player) {
            this.player.x = Phaser.Math.Clamp(this.player.x, 20, gameSize.width - 20);
            this.player.y = Phaser.Math.Clamp(this.player.y, 40, gameSize.height - 40);
        }

        // Cập nhật parallax
        if (this.parallaxMgr) {
            this.parallaxMgr.handleResize(gameSize);
        }
    }

    startAutoShoot() {
        if (this.shootTimer) {
            this.shootTimer.destroy();
        }
        this.shootTimer = this.time.addEvent({
            delay: this.player.shootDelay,
            loop: true,
            callback: () => {
                if (this.player.isAlive && !this.paused) {
                    this.player.shoot();
                }
            }
        });
    }

    _onBulletHitEnemy(bullet, enemy) {
        if (!enemy.active || !bullet.active) return;
        bullet.disableBody(true, true);

        const isDead = enemy.hit(this.player.damage);
        if (isDead) {
            this.score += enemy.score;
            this.ui.updateScore(this.score);

            Explosion.spawn(this, enemy.x, enemy.y, enemy.isBoss ? "large" : "medium");
            this.audioManager.playSFX("sfx_explosion");
            const ex = this.explosions.get();
            if (ex) ex.spawn(enemy.x, enemy.y);

            // Drop items theo drop table cua quai
            const table = enemy.dropTable || ["heal"];
            if (enemy.isBoss) {
                // Boss chet roi nhieu do
                const dropCount = 4;
                const offsets = [-60, -20, 20, 60];
                for (let i = 0; i < dropCount; i++) {
                    const item = this.items.get();
                    if (item) {
                        const type = table[Math.floor(Math.random() * table.length)];
                        item.spawn(enemy.x + offsets[i], enemy.y, type);
                    }
                }
                this.ui.unbindBoss();
            } else {
                // Quan thuong: drop theo xac suat
                if (Math.random() < (enemy.dropChance || 0.12)) {
                    const item = this.items.get();
                    if (item) {
                        const type = table[Math.floor(Math.random() * table.length)];
                        item.spawn(enemy.x, enemy.y, type);
                    }
                }
            }

            // Xoa khoi tracked minions
            if (enemy.isSummoned) {
                this._trackedMinions.delete(enemy);
            } else {
                this.waveMgr.onEnemyDefeated();
            }
        }
    }

    _onBulletHitPlayer(player, bullet) {
        if (!bullet.active || !player.isAlive) return;
        bullet.disableBody(true, true);
        this._damagePlayer(bullet.damage || 10);
    }

    _onEnemyHitPlayer(player, enemy) {
        if (!enemy.active || !player.isAlive) return;
        const dmg = enemy.bulletDmg || 20;
        enemy.die();
        Explosion.spawn(this, enemy.x, enemy.y, "medium");
        this._damagePlayer(dmg);
        if (enemy.isSummoned) {
            this._trackedMinions.delete(enemy);
        } else {
            this.waveMgr.onEnemyDefeated();
        }
    }

    _onPlayerCollectItem(player, item) {
        if (!item.active || !player.isAlive) return;
        item.applyEffect(player);
        this.audioManager.playSFX("sfx_upgrade"); // Sẽ tải audio thật ở Module 2
    }

    _damagePlayer(amount) {
        const isDead = this.player.takeDamage(amount);
        this.cameras.main.flash(100, 255, 0, 0);
        this.audioManager.playSFX("sfx_hit");
        
        if (isDead) {
            this._onGameOver();
        }
    }

    _onWaveCleared(data) {
        if (this.waveMgr.isAllCleared) return;
        // Chong goi nhieu lan
        if (this._waveClearLock) return;
        this._waveClearLock = true;

        if (data.isBoss) {
            // Boss wave xong → tiep tuc wave sau (neu con)
            this.time.delayedCall(1200, () => {
                this._waveClearLock = false;
                this.waveMgr.startNextWave();
            });
            return;
        }

        // Sau wave thuong → chon nang cap
        this._showUpgradeScreen(() => {
            this._waveClearLock = false;
            this.time.delayedCall(600, () => this.waveMgr.startNextWave());
        });
    }

    _showUpgradeScreen(onDone) {
    if (this.paused) {
        if (onDone) onDone();   // ← BẮT BUỘC gọi, không thì treo game
        return;
    }
    this.physics.pause();
    this.paused = true;

    this.scene.launch(GAME.SCENES.UPGRADE, {
        onComplete: (upgradeId) => {
            this.physics.resume();
            this.paused = false;
            if (upgradeId) {
                this.player.applyUpgrade(upgradeId);
                this.audioManager.playSFX("sfx_upgrade");
            }
            if (onDone) onDone();
        }
    });
}

    _onVictory() {
        this.physics.pause();
        this.paused = true;
        this.audioManager.stopBGM();

        const hpPct = this.player.hp / this.player.maxHp;
        const stars = calcStars(hpPct, this.playTimeSec, this.stageId);

        SaveManager.saveVictory({
            stageId: this.stageId,
            stars: stars,
            score: this.score,
            timeSec: this.playTimeSec,
            enemiesKilled: this.waveMgr.enemiesSpawned
        });

        this.time.delayedCall(1500, () => {
            this.scene.stop();
            this.scene.start(GAME.SCENES.VICTORY, {
                stageId: this.stageId, score: this.score, stars, timeSec: this.playTimeSec
            });
        });
    }

    _onGameOver() {
        this.physics.pause();
        this.paused = true;
        this.audioManager.stopBGM();

        SaveManager.saveGameOver({
            stageId: this.stageId,
            score: this.score,
            timeSec: this.playTimeSec,
            enemiesKilled: this.waveMgr.enemiesSpawned
        });

        this.time.delayedCall(1000, () => {
            this.scene.stop();
            this.scene.start(GAME.SCENES.GAME_OVER, {
                stageId: this.stageId, score: this.score, wave: this.waveMgr.currentWaveIndex
            });
        });
    }

    update(time, delta) {
        if (this.paused) return;

        if (this.parallaxMgr) this.parallaxMgr.update(delta);
        this.player.update(delta);
        this.ui.updatePlayerHP(this.player.hp, this.player.maxHp);
        this.ui.update();

        if (!this.ui.isBossActive) {
            const boss = this.enemies.getChildren().find(e => e.active && e.isBoss);
            if (boss) this.ui.bindBoss(boss);
        }

        if (this.player.isAlive) {
            this.enemies.getChildren().forEach(e => {
                if (e.active && e.isBoss && e._isLasering) {
                    const lx = e.getLaserX();
                    if (Math.abs(this.player.x - lx) < 20) {
                        this._damagePlayer(e._laserDmg);
                    }
                }
            });
        }
    }
}
