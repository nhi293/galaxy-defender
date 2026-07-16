// ============================================================
// PreloadScene.js – Load tất cả assets
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.PRELOAD);
    }

    preload() {
        this._buildLoadingUI();
        this._loadAllAssets();
    }

    create() {
        this.time.delayedCall(400, () => {
            this.scene.start(GAME.SCENES.SPLASH);
        });
    }

    // --- Loading UI ---

    _buildLoadingUI() {
        const { width, height } = this.cameras.main;
        const cx = width / 2;
        const cy = height / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);

        for (let i = 0; i < 80; i++) {
            this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 2),
                0xffffff,
                Phaser.Math.FloatBetween(0.2, 0.8)
            );
        }

        this.add.text(cx, 140, GAME.TITLE, {
            fontSize: "34px",
            color: GAME.COLORS.TEXT_CYAN,
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5);

        const boxX = cx - 160;
        const boxY = cy;
        const bg = this.add.graphics();
        bg.fillStyle(0x223344, 0.8);
        bg.fillRoundedRect(boxX, boxY, 320, 30, 8);

        const bar = this.add.graphics();

        const pctText = this.add.text(cx, cy + 15, "0%", {
            fontSize: "18px",
            color: "#aaaacc",
        }).setOrigin(0.5);

        const loadTxt = this.add.text(cx, cy - 40, "LOADING...", {
            fontSize: "18px",
            color: "#aaaacc",
        }).setOrigin(0.5);

        this.load.on("progress", (value) => {
            bar.clear()
                .fillStyle(0x00ffcc, 1)
                .fillRoundedRect(boxX + 4, boxY + 4, 312 * value, 22, 6);
            pctText.setText(Math.floor(value * 100) + "%");
        });

        this.load.on("complete", () => {
            loadTxt.setText("READY!");
            pctText.setText("100%");
        });
    }

    // --- Assets ---

    _loadAllAssets() {
        this.load.image("player", "assets/player/ship_lv1.png");

        this.load.image("enemy1", "assets/enemies/enemy_lv1.png");
        this.load.image("enemy2", "assets/enemies/enemy_lv2.png");
        this.load.image("enemy3", "assets/enemies/enemy_lv3.png");
        this.load.image("enemy4", "assets/enemies/enemy_lv4.png");
        this.load.image("enemy5", "assets/enemies/enemy_lv5.png");

        this.load.image("boss1", "assets/bosses/boss_lv1.png");
        this.load.image("boss2", "assets/bosses/boss_lv1.png");

        this.load.audio("bgm_menu",     "assets/audio/bgm_menu.mp3");
        this.load.audio("bgm_tutorial",  "assets/audio/bgm_tutorial.mp3");
        this.load.audio("bgm_stage1",    "assets/audio/bgm_stage1.mp3");
        this.load.audio("bgm_stage2",    "assets/audio/bgm_stage2.mp3");
        this.load.audio("bgm_stage3",    "assets/audio/bgm_stage3.mp3");
        this.load.audio("bgm_stage4",    "assets/audio/bgm_stage4.mp3");
        this.load.audio("bgm_stage5",    "assets/audio/bgm_stage5.mp3");
        this.load.audio("bgm_boss",      "assets/audio/bgm_boss.mp3");
        this.load.audio("bgm_victory",   "assets/audio/bgm_victory.mp3");
        this.load.audio("bgm_gameover",  "assets/audio/bgm_gameover.mp3");

        this.load.audio("sfx_shoot",     "assets/audio/sfx_shoot.wav");
        this.load.audio("sfx_hit",        "assets/audio/sfx_hit.wav");
        this.load.audio("sfx_explosion",  "assets/audio/sfx_explosion.wav");
        this.load.audio("sfx_siren",      "assets/audio/sfx_siren.mp3");
        this.load.audio("sfx_upgrade",    "assets/audio/sfx_upgrade.mp3");

        this.load.image("bulletPlayer", "assets/bullets/bullet_player.png");
        this.load.image("bulletEnemy",  "assets/bullets/bullet_enemy.png");

        this.load.image("itemHp",      "assets/items/shield.png");
        this.load.image("itemCoin",    "assets/items/damage.png");
        this.load.image("itemPowerUp", "assets/items/damage.png");
        this.load.image("itemExp",     "assets/items/shield.png");

        // Backgrounds (moi stage co nen rieng)
        this.load.image("bg_menu",     "assets/images/bg_menu.png");
        this.load.image("bg_tutorial", "assets/images/bg_tutorial.png");
        this.load.image("bg_stage1",   "assets/images/bg_stage1.png");
        this.load.image("bg_stage2",   "assets/images/bg_stage2.png");
        this.load.image("bg_stage3",   "assets/images/bg_stage3.png");
    }
}