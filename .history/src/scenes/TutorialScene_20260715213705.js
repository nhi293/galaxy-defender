// ============================================================
// TutorialScene.js – Tutorial có gameplay thực sự
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import Player from "../objects/Player";
import Bullet from "../objects/Bullet";
import Enemy from "../objects/Enemy";
import EnemyBullet from "../objects/EnemyBullet";
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

        this.audioManager = new AudioManager(this);
        this.audioManager.playBGM("bgm_tutorial");

        this._stars = new StarField(this, 80);

        this.score       = 0;
        this.killed      = 0;

        // Player
        this.player = new Player(this, cx, height - 80);
        this.input.on("pointermove", (ptr) => {
            if (this.player.isAlive) {
                this.player.x = Phaser.Math.Clamp(ptr.x, 20, width - 20);
                this.player.y = Phaser.Math.Clamp(ptr.y, 40, height - 40);
            }
        });

        // Groups
        this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 60, runChildUpdate: true });
        this.enemies       = this.physics.add.group({ classType: Enemy, maxSize: 10, runChildUpdate: true });
        this.enemyBullets  = this.physics.add.group({ classType: EnemyBullet, maxSize: 30, runChildUpdate: true });

        this.physics.add.overlap(this.playerBullets, this.enemies, this._onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this._onBulletHitPlayer, null, this);

        // UI
        this._scoreTxt = this.add.text(10, 10, `${I18n.get("SCORE")}: 0`, { fontSize: "16px", color: "#00ffcc" }).setDepth(10);
        
        const txt = this.add.text(cx, height / 2 - 50, I18n.get("TUTORIAL_INSTR"), {
            fontSize: "18px", color: "#ffffff", align: "center", lineSpacing: 10
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.tweens.add({ targets: txt, alpha: 0, duration: 500 });
        });

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });

        // Shoot input
        this.input.on("pointerdown", () => this.player.shoot());

        // Spawn enemies slowly
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                if (this.killed < 3) {
                    const e = this.enemies.get();
                    if (e) {
                        e.spawn(Phaser.Math.Between(40, width - 40), -20, "enemy1", 0.5);
                    }
                }
            }
        });
    }

    handleResize(gameSize) {
        // Cập nhật lại các giới hạn của player nếu cần
        // Vị trí text hướng dẫn (nếu còn)
        // Score đã neo ở góc trái trên rồi
    }

    _onBulletHitEnemy(bullet, enemy) {
        if (!enemy.active || !bullet.active) return;
        bullet.disableBody(true, true);
        const killed = enemy.hit(this.player.damage);
        if (killed) {
            this.score += enemy.score;
            this.killed++;
            this._scoreTxt.setText(`${I18n.get("SCORE")}: ${this.score}`);
            Explosion.spawn(this, enemy.x, enemy.y, "medium");
            this.audioManager.playSFX("sfx_explosion");
            
            if (this.killed >= 3) {
                this.time.delayedCall(800, () => this._finish(true));
            }
        }
    }

    _onBulletHitPlayer(player, bullet) {
        if (!bullet.active || !player.isAlive) return;
        bullet.disableBody(true, true);
        player.takeDamage(bullet.damage ?? 8);
        this._playerHitEffect();
        if (!player.isAlive) {
            this.time.delayedCall(500, () => this._finish(false));
        }
    }

    _playerHitEffect() {
        this.cameras.main.flash(100, 255, 0, 0);
        this.audioManager.playSFX("sfx_hit");
    }

    _finish(victory = true) {
        if (victory) {
            SaveManager.saveVictory({
                stageId: "tutorial",
                stars: 3,
                score: this.score,
                timeSec: 30,
                enemiesKilled: this.killed,
            });
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => {
                this.scene.start(GAME.SCENES.VICTORY, {
                    stageId: "tutorial", score: this.score, stars: 3, timeSec: 30
                });
            });
        } else {
            SaveManager.saveGameOver({
                stageId: "tutorial",
                score: this.score,
                timeSec: 15,
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
        this.player.update();
    }
}