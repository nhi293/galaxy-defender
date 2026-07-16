// ============================================================
// GameScene.js – Man choi chinh (V2.2 - Fixed All Bugs)
// Fix: stageCfg undefined, Explosion group, mobile controls,
//      boss minion heal, wave freeze, auto shoot, audio
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
        this.stageId  = data?.stageId ?? 1;
        // Fallback: neu stageId khong hop le thi dung stage 1
        this.stageCfg = STAGES[this.stageId] ?? STAGES[1];
        this._waveClearLock = false;
        this._trackedMinions = new Set();
    }

    create() {
        const { width, height } = this.scale;
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(500);

        // ─── Audio ─────────────────────────────────────────────────
        this.audioManager = new AudioManager(this);
        // Phat nhac sau user gesture (AudioContext policy)
        this.input.once("pointerdown", () => {
            this.audioManager.playBGM(this.stageCfg.baseBgm || "bgm_stage1");
        });
        // Cung co gang phat ngay (desktop)
        try {
            this.audioManager.playBGM(this.stageCfg.baseBgm || "bgm_stage1");
        } catch(e) { /* se phat sau touch */ }

        // ─── Background ────────────────────────────────────────────
        const bgMap = { 0: "bg_tutorial", 1: "bg_stage1", 2: "bg_stage2", 3: "bg_stage3", 4: "bg_stage3", 5: "bg_stage2" };
        const bgKey = bgMap[this.stageId] || "bg_stage1";
        this.parallaxMgr = new ParallaxManager(this, this.textures.exists(bgKey) ? bgKey : "bg_stage1");

        // ─── Object Groups ─────────────────────────────────────────
        // NOTE: Explosion la static class, khong dung add.group
        this.playerBullets = this.physics.add.group({ classType: Bullet,      maxSize: 150, runChildUpdate: true });
        this.enemies       = this.physics.add.group({ classType: Enemy,       maxSize: 200, runChildUpdate: true });
        this.enemyBullets  = this.physics.add.group({ classType: EnemyBullet, maxSize: 400, runChildUpdate: true });
        this.items         = this.physics.add.group({ classType: Item,        maxSize: 40,  runChildUpdate: true });

        // ─── Player ────────────────────────────────────────────────
        this.player = new Player(this, width / 2, height - 90);

        // ─── Mobile / Desktop Controls ──────────────────────────────
        // Tau LUON di chuyen theo con tro / ngon tay
        // Khong can nhan – chi can rong tren man hinh la tau theo
        this.input.on("pointermove", (ptr) => {
            if (!this.player?.isAlive || this.paused) return;
            this._movePlayerTo(ptr.x, ptr.y);
        });

        // Tren mobile: touch move
        this.input.on("pointerdown", (ptr) => {
            if (!this.player?.isAlive || this.paused) return;
            this._movePlayerTo(ptr.x, ptr.y);
        });

        this.input.on("pointermove", (ptr) => {
            if (!this.player?.isAlive || this.paused) return;
            if (ptr.isDown) this._movePlayerTo(ptr.x, ptr.y);   // desktop drag
            else             this._movePlayerTo(ptr.x, ptr.y);   // mouse hover
        });

        // ─── Auto Shoot ────────────────────────────────────────────
        this._dragActive = false;
        this.startAutoShoot();

        // ─── UI ────────────────────────────────────────────────────
        this.ui = new UIManager(this);

        // ─── State ─────────────────────────────────────────────────
        this.score       = 0;
        this.playTimeSec = 0;
        this.paused      = false;

        this.time.addEvent({
            delay: 1000, loop: true,
            callback: () => { if (!this.paused) this.playTimeSec++; }
        });

        // ─── Collisions ────────────────────────────────────────────
        this.physics.add.overlap(this.playerBullets, this.enemies,   this._onBulletHitEnemy,  null, this);
        this.physics.add.overlap(this.enemyBullets,  this.player,    this._onBulletHitPlayer, null, this);
        this.physics.add.overlap(this.enemies,       this.player,    this._onEnemyHitPlayer,  null, this);
        this.physics.add.overlap(this.items,         this.player,    this._onCollectItem,     null, this);

        // ─── Events ────────────────────────────────────────────────
        this.events.on("player-fire-rate-changed", () => this.startAutoShoot());

        // Boss sinh quai nho – co theo doi de boss hoi mau
        this.events.on("boss-summon-tracked", (data) => {
            this._onBossSummon(data);
        });

        this.events.on("wave-started",     (d) => this.ui.updateWave(d.wave, d.isBoss));
        this.events.on("wave-cleared",     (d) => this._onWaveCleared(d));
        this.events.on("all-waves-cleared",    () => this._onVictory());
        this.events.on("enemy-escaped",  (enemy) => this._onEnemyEscaped(enemy));

        // ─── Wave ──────────────────────────────────────────────────
        this.difficulty = getDifficulty(this.stageId);
        this.waveMgr    = new WaveManager(this, this.stageCfg?.waves ?? [], this.difficulty);
        this.time.delayedCall(1200, () => this.waveMgr.startNextWave());

        // ─── Resize ────────────────────────────────────────────────
        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    // ─── Di chuyen player den toa do ─────────────────────────────
    _movePlayerTo(x, y) {
        const cw = this.scale.width;
        const ch = this.scale.height;
        this.player.x = Phaser.Math.Clamp(x, 20, cw - 20);
        this.player.y = Phaser.Math.Clamp(y, 40, ch - 40);
    }

    handleResize(gameSize) {
        this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
        if (this.player) {
            this.player.x = Phaser.Math.Clamp(this.player.x, 20, gameSize.width  - 20);
            this.player.y = Phaser.Math.Clamp(this.player.y, 40, gameSize.height - 40);
        }
        if (this.parallaxMgr) this.parallaxMgr.handleResize(gameSize);
    }

    // ─── Auto Shoot ──────────────────────────────────────────────
    startAutoShoot() {
        if (this.shootTimer) { this.shootTimer.remove(); this.shootTimer = null; }
        this.shootTimer = this.time.addEvent({
            delay: this.player ? this.player.shootDelay : 280,
            loop: true,
            callback: () => {
                if (this.player?.isAlive && !this.paused) this.player.shoot();
            }
        });
    }

    // ─── Boss Summon ─────────────────────────────────────────────
   _onBossSummon(data) {
    const { boss, count, type, emergency } = data;
    const width = this.scale.width;

    const label = this.add.text(boss.x, boss.y - 65, emergency ? "!! KHẨN CẤP !!" : "!! MINIONS !!", {
        fontFamily: GAME.FONT, fontSize: "22px",
        color: emergency ? "#ff3333" : "#ffcc00", stroke: "#000", strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({ targets: label, y: label.y - 35, alpha: 0, duration: 1500,
        onComplete: () => label.destroy() });

    // Chia man hinh thanh cac o (slot) cach deu de quai khong bi sat nhau
    const margin = 40;
    const usableW = Math.max(width - margin * 2, 100);
    const slotW = usableW / Math.max(count, 1);
    const positions = [];
    for (let i = 0; i < count; i++) {
        const slotStart = margin + i * slotW;
        positions.push(slotStart + Phaser.Math.Between(slotW * 0.15, slotW * 0.85));
    }
    Phaser.Utils.Array.Shuffle(positions);

    const spawnOne = (idx) => {
        if (idx >= count) return;
        const e = this.enemies.get();
        if (e) {
            const spawnX = Phaser.Math.Clamp(positions[idx], margin, width - margin);
            const spawnY = emergency ? -30 : Phaser.Math.Between(-90, -20);
            e.spawn(spawnX, spawnY, type, this.waveMgr.difficulty);
            e._waveId     = this.waveMgr._currentWaveId;
            e.isSummoned  = true;
            e._summonBoss = boss;
            this._trackedMinions.add(e);
        }
    };

    if (emergency) {
        // Khan cap: ra nhanh, cach nhau 150ms de tao thanh hang chan dan
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 150, () => spawnOne(i));
        }
    } else {
        // Binh thuong: rai ra tu tu trong vong 10 giay
        const totalWindow = 10000;
        const gap = count > 1 ? totalWindow / count : 0;
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * gap, () => spawnOne(i));
        }
    }
}

    // ─── Enemy Escaped ───────────────────────────────────────────
    _onEnemyEscaped(enemy) {
        if (!enemy) return;
        if (enemy.isSummoned && enemy._summonBoss?.active) {
            // Quai nho tron thoat -> boss hoi mau
            const boss = enemy._summonBoss;
            const heal = Math.floor(boss.maxHp * (boss._minionHealPct || 0.02));
            boss.hp = Math.min(boss.maxHp, boss.hp + heal);
            boss._updateHpBar();

            const htxt = this.add.text(boss.x, boss.y - 45, "+" + heal + " HP", {
                fontSize: "16px", color: "#00ff88", fontStyle: "bold",
                stroke: "#000", strokeThickness: 3
            }).setOrigin(0.5).setDepth(50);
            this.tweens.add({ targets: htxt, y: htxt.y - 45, alpha: 0, duration: 1000,
                onComplete: () => htxt.destroy() });
        }
        if (enemy.isSummoned) {
            this._trackedMinions.delete(enemy);
        } else {
            this.waveMgr.onEnemyEscaped(enemy);  // truyen enemy de check waveId
        }
    }

    // ─── Collision Handlers ──────────────────────────────────────
    _onBulletHitEnemy(bullet, enemy) {
        if (!enemy.active || !bullet.active) return;
        bullet.disableBody(true, true);

        const isDead = enemy.hit(this.player.damage);
        if (!isDead) return;

        this.score += enemy.score;
        this.ui.updateScore(this.score);

        // Explosion effect
        Explosion.spawn(this, enemy.x, enemy.y, enemy.isBoss ? "large" : "medium");
        this.audioManager.playSFX("sfx_explosion");

        // Drop items theo drop table cua quai
        const table = enemy.dropTable || ["heal"];
        if (enemy.isBoss) {
            const offsets = [-65, -20, 20, 65];
            for (let i = 0; i < 4; i++) {
                const it = this.items.get();
                if (it) it.spawn(enemy.x + offsets[i], enemy.y, table[i % table.length]);
            }
            this.ui.unbindBoss();
        } else {
            if (Math.random() < (enemy.dropChance || 0.12)) {
                const it = this.items.get();
                if (it) it.spawn(enemy.x, enemy.y, table[Math.floor(Math.random() * table.length)]);
            }
        }

        if (enemy.isSummoned) {
            this._trackedMinions.delete(enemy);
        } else {
            this.waveMgr.onEnemyDefeated(enemy);  // truyen enemy de check waveId
        }
    }

    _onBulletHitPlayer(player, bullet) {
        if (!bullet.active || !player.isAlive) return;
        bullet.disableBody(true, true);
        this._damagePlayer(bullet.damage || 10);
    }

    _onEnemyHitPlayer(player, enemy) {
        if (!enemy.active || !player.isAlive) return;
        const dmg = Math.max(enemy.bulletDmg || 0, 15);
        enemy.die();
        Explosion.spawn(this, enemy.x, enemy.y, "medium");
        this._damagePlayer(dmg);

        if (enemy.isSummoned) {
            this._trackedMinions.delete(enemy);
        } else {
            this.waveMgr.onEnemyDefeated(enemy);  // truyen enemy de check waveId
        }
    }

    _onCollectItem(player, item) {
        if (!item.active || !player.isAlive) return;
        item.applyEffect(player);
        // Refresh auto-shoot neu co nang cap fire rate
        this.startAutoShoot();
        this.audioManager.playSFX("sfx_upgrade");
    }

    _damagePlayer(amount) {
        if (!this.player.isAlive) return;
        const isDead = this.player.takeDamage(amount);
        this.cameras.main.flash(120, 255, 0, 0, 0.6);
        this.audioManager.playSFX("sfx_hit");
        if (isDead) this._onGameOver();
    }

    // ─── Wave Logic ──────────────────────────────────────────────
    _onWaveCleared(data) {
        if (this.waveMgr.isAllCleared) return;
        if (this._waveClearLock) return;
        this._waveClearLock = true;

        if (data.isBoss) {
            this.time.delayedCall(1200, () => {
                this._waveClearLock = false;
                this.waveMgr.startNextWave();
            });
            return;
        }

        // Sau wave thuong -> hien man nang cap
        this._showUpgradeScreen(() => {
            this._waveClearLock = false;
            this.time.delayedCall(700, () => this.waveMgr.startNextWave());
        });
    }

    _showUpgradeScreen(onDone) {
        if (this.paused) return;
        this.physics.pause();
        this.paused = true;
        if (this.shootTimer) { this.shootTimer.paused = true; }

        this.scene.launch(GAME.SCENES.UPGRADE, {
            onComplete: (upgradeId) => {
                this.physics.resume();
                this.paused = false;
                if (this.shootTimer) { this.shootTimer.paused = false; }

                if (upgradeId) {
                    this.player.applyUpgrade(upgradeId);
                    this.startAutoShoot();
                }
                if (onDone) onDone();
            }
        });
    }

    // ─── Victory / Game Over ─────────────────────────────────────
    _onVictory() {
        if (this.paused) return;
        this.physics.pause();
        this.paused = true;
        this.audioManager.stopBGM();

        const hpPct = this.player.hp / this.player.maxHp;
        const stars = calcStars(hpPct, this.playTimeSec, this.stageId);

        SaveManager.saveVictory({
            stageId: this.stageId, stars, score: this.score,
            timeSec: this.playTimeSec, enemiesKilled: this.waveMgr.enemiesSpawned
        });

        this.time.delayedCall(1500, () => {
            this.scene.stop();
            this.scene.start(GAME.SCENES.VICTORY, {
                stageId: this.stageId, score: this.score, stars, timeSec: this.playTimeSec
            });
        });
    }

    _onGameOver() {
        if (this.paused) return;
        this.physics.pause();
        this.paused = true;
        this.audioManager.stopBGM();

        SaveManager.saveGameOver({
            stageId: this.stageId, score: this.score,
            timeSec: this.playTimeSec, enemiesKilled: this.waveMgr.enemiesSpawned
        });

        this.time.delayedCall(1000, () => {
            this.scene.stop();
            this.scene.start(GAME.SCENES.GAME_OVER, {
                stageId: this.stageId, score: this.score, wave: this.waveMgr.currentWaveIndex
            });
        });
    }

    // ─── Update Loop ─────────────────────────────────────────────
    update(time, delta) {
        if (this.paused) return;

        if (this.parallaxMgr) this.parallaxMgr.update(delta);
        this.player.update(delta);
        this.ui.updatePlayerHP(this.player.hp, this.player.maxHp);
        this.ui.update();

        // Auto-bind boss HP bar
        if (!this.ui.isBossActive) {
            const boss = this.enemies.getChildren().find(e => e.active && e.isBoss);
            if (boss) this.ui.bindBoss(boss);
        }

        // Laser damage check
        if (this.player.isAlive) {
            this.enemies.getChildren().forEach(e => {
                if (e.active && e.isBoss && e._isLasering) {
                    if (Math.abs(this.player.x - e.getLaserX()) < 22) {
                        this._damagePlayer(e._laserDmg || 20);
                    }
                }
            });
        }
    }
}
