// ============================================================
// TutorialScene.js – Tutorial: tu dong ban, boss yeu, roi do nhieu
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import Player from "../objects/Player";
import Bullet from "../objects/Bullet";
import Enemy from "../objects/Enemy";
import EnemyBullet from "../objects/EnemyBullet";
import Item from "../objects/Item";
import Explosion from "../objects/Explosion";
import SaveManager from "../managers/SaveManager";
import StarField from "../objects/StarField";
import AudioManager from "../managers/AudioManager";
import I18n from "../configs/I18nConfig";

export default class TutorialScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.TUTORIAL);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(400);

        // Tu dong phat nhac khi vao man
        this.audioManager = new AudioManager(this);
        this.audioManager.playBGM("bgm_tutorial");

        this._stars = new StarField(this, 80);

        this.score  = 0;
        this.killed = 0;
        this.bossPhase = false;

        // Player – cho cam giac dan nhieu + ky nang ngay tu dau
        this.player = new Player(this, cx, height - 80);
        this.player.bulletCount = 2;
        this.player.bulletSpread = 1;

        this.input.on("pointermove", (ptr) => {
            if (this.player.isAlive) {
                this.player.x = Phaser.Math.Clamp(ptr.x, 20, width - 20);
                this.player.y = Phaser.Math.Clamp(ptr.y, 40, height - 40);
            }
        });

        // Groups
        this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 80, runChildUpdate: true });
        this.enemies       = this.physics.add.group({ classType: Enemy, maxSize: 10, runChildUpdate: true });
        this.enemyBullets  = this.physics.add.group({ classType: EnemyBullet, maxSize: 60, runChildUpdate: true });
        this.items         = this.physics.add.group({ classType: Item, maxSize: 20, runChildUpdate: true });

        this.physics.add.overlap(this.playerBullets, this.enemies, this._onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this._onBulletHitPlayer, null, this);
        this.physics.add.overlap(this.items, this.player, this._onPlayerCollectItem, null, this);
        this.physics.add.overlap(this.enemies, this.player, this._onEnemyHitPlayer, null, this);

        // UI
        this._scoreTxt = this.add.text(10, 10, `${I18n.get("SCORE")}: 0`, { fontSize: "16px", color: "#00ffcc" }).setDepth(10);

        const txt = this.add.text(cx, height / 2 - 50, I18n.get("TUTORIAL_INSTR"), {
            fontSize: "18px", color: "#ffffff", align: "center", lineSpacing: 10
        }).setOrigin(0.5).setDepth(10);

        this.time.delayedCall(3000, () => {
            this.tweens.add({ targets: txt, alpha: 0, duration: 500 });
        });

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
            if (this.shootTimer) this.shootTimer.destroy();
        });

        // Tu dong ban (khong can bam man hinh nua)
        this.startAutoShoot();

        // Spawn 3 quai thuong truoc, roi den boss yeu
        this._spawnTimer = this.time.addEvent({
            delay: 1600,
            repeat: 2,
            callback: () => {
                const e = this.enemies.get();
                if (e) e.spawn(Phaser.Math.Between(40, width - 40), -20, "enemy1", 0.5);
            }
        });
    }

    startAutoShoot() {
        if (this.shootTimer) this.shootTimer.destroy();
        this.shootTimer = this.time.addEvent({
            delay: this.player.shootDelay,
            loop: true,
            callback: () => {
                if (this.player.isAlive) this.player.shoot();
            }
        });
    }

    handleResize(gameSize) {
        // Score neo goc trai tren, khong can cap nhat
    }

    _onBulletHitEnemy(bullet, enemy) {
        if (!enemy.active || !bullet.active) return;
        bullet.disableBody(true, true);
        const killed = enemy.hit(this.player.damage);

        if (killed) {
            this.score += enemy.score;
            this._scoreTxt.setText(`${I18n.get("SCORE")}: ${this.score}`);
            Explosion.spawn(this, enemy.x, enemy.y, enemy.isBoss ? "large" : "medium");
            this.audioManager.playSFX("sfx_explosion");

            if (enemy.isBoss) {
                // Boss yeu chet -> roi nhieu do -> ket thuc tutorial
                const table = enemy.dropTable || ["heal", "dmg"];
                const offsets = [-50, -15, 15, 50];
                offsets.forEach((off) => {
                    const item = this.items.get();
                    if (item) {
                        const type = table[Math.floor(Math.random() * table.length)];
                        item.spawn(enemy.x + off, enemy.y, type);
                    }
                });
                this.time.delayedCall(900, () => this._finish(true));
            } else {
                this.killed++;
                // Roi do 100% cho quai thuong trong tutorial (cam giac nhieu ky nang)
                const item = this.items.get();
                if (item) {
                    const table = enemy.dropTable || ["heal", "dmg", "rapid", "spread"];
                    const type = table[Math.floor(Math.random() * table.length)];
                    item.spawn(enemy.x, enemy.y, type);
                }

                // Sau khi giet du 3 quai thuong -> boss yeu xuat hien
                if (this.killed >= 3 && !this.bossPhase) {
                    this.bossPhase = true;
                    this.time.delayedCall(1200, () => {
                        const { width } = this.scale;
                        const boss = this.enemies.get();
                        if (boss) boss.spawn(width / 2, -100, "bossTutorial", 0.5);
                    });
                }
            }
        }
    }

    _onBulletHitPlayer(player, bullet) {
        if (!bullet.active || !player.isAlive) return;
        bullet.disableBody(true, true);
        player.takeDamage(bullet.damage ?? 6);
        this._playerHitEffect();
        if (!player.isAlive) {
            this.time.delayedCall(500, () => this._finish(false));
        }
    }

    _onEnemyHitPlayer(player, enemy) {
        if (!enemy.active || !player.isAlive) return;
        const dmg = enemy.bulletDmg || 10;
        enemy.die();
        Explosion.spawn(this, enemy.x, enemy.y, "medium");
        player.takeDamage(dmg);
        this._playerHitEffect();
        if (!player.isAlive) {
            this.time.delayedCall(500, () => this._finish(false));
        }
    }

    _onPlayerCollectItem(player, item) {
        if (!item.active || !player.isAlive) return;
        item.applyEffect(player);
        this.audioManager.playSFX("sfx_upgrade");
    }

    _playerHitEffect() {
        this.cameras.main.flash(100, 255, 0, 0);
        this.audioManager.playSFX("sfx_hit");
    }

    _finish(victory = true) {
        if (this.shootTimer) this.shootTimer.destroy();

        if (victory) {
            SaveManager.saveVictory({
                stageId: "tutorial",
                stars: 3,
                score: this.score,
                timeSec: 40,
                enemiesKilled: this.killed + 1,
            });
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start(GAME.SCENES.VICTORY, {
                    stageId: "tutorial", score: this.score, stars: 3, timeSec: 40
                });
            });
        } else {
            SaveManager.saveGameOver({
                stageId: "tutorial",
                score: this.score,
                timeSec: 20,
                enemiesKilled: this.killed,
            });
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start(GAME.SCENES.GAME_OVER, {
                    stageId: "tutorial", score: this.score, wave: 1
                });
            });
        }
    }

    update(time, delta) {
        this._stars.update(delta);
        this.player.update(delta);
    }
}