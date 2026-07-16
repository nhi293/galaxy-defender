// ============================================================
// SplashScene.js – Hiển thị logo/intro trước khi vào menu
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import StarField from "../objects/StarField";

export default class SplashScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.SPLASH);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(500);

        this._stars = new StarField(this, 100, "menu");

        // Simple Logo text
        const logo = this.add.text(cx, cy - 40, "GALAXY DEFENDER", {
            fontSize: "40px",
            color: GAME.COLORS.TEXT_CYAN,
            fontStyle: "bold",
            stroke: "#003355",
            strokeThickness: 8,
        }).setOrigin(0.5).setAlpha(0);

        const sub = this.add.text(cx, cy + 30, "A Phaser 3 Game", {
            fontSize: "20px",
            color: "#aaaaaa",
        }).setOrigin(0.5).setAlpha(0);

        // Sequence
        this.tweens.add({
            targets: [logo, sub],
            alpha: 1,
            y: "-=10",
            duration: 800,
            ease: "Power2",
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.cameras.main.fadeOut(500);
                    this.time.delayedCall(500, () => {
                        this.scene.start(GAME.SCENES.MAIN_MENU);
                    });
                });
            }
        });
    }

    update(time, delta) {
        this._stars.update(delta);
    }
}