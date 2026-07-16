// ============================================================
// PauseScene.js – Hiển thị menu Pause
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import I18n from "../configs/I18nConfig";

export default class PauseScene extends Phaser.Scene {

    constructor() {
        super({ key: GAME.SCENES.PAUSE, active: false });
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        this.cameras.main.fadeIn(200);

        this.add.rectangle(cx, cy, width, height, 0x000000, 0.7)
            .setDepth(100);

        const panelW = 280, panelH = 320;
        this.add.graphics()
            .fillStyle(0x0a1530, 0.95)
            .fillRoundedRect(cx - panelW/2, cy - panelH/2, panelW, panelH, 12)
            .lineStyle(2, 0x00aaff, 0.8)
            .strokeRoundedRect(cx - panelW/2, cy - panelH/2, panelW, panelH, 12)
            .setDepth(101);

        this.add.text(cx, cy - 100, I18n.get("PAUSED"), {
            fontSize: "28px", color: GAME.COLORS.TEXT_CYAN, fontStyle: "bold"
        }).setOrigin(0.5).setDepth(102);

        this._createBtn(cx, cy - 20, I18n.get("RESUME"), () => {
            this.scene.stop();
            const g = this.scene.get(GAME.SCENES.GAME);
            g.paused = false;
            g.physics.resume();
        });

        this._createBtn(cx, cy + 50, I18n.get("MAIN_MENU"), () => {
            this.scene.stop();
            const g = this.scene.get(GAME.SCENES.GAME);
            g.scene.stop();
            this.scene.start(GAME.SCENES.MAIN_MENU);
        });

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        // Pause scene thường được đặt lại (hoặc đóng) khi resize trên mobile, 
        // nhưng nếu muốn giữ nguyên có thể gọi lại create hoặc update layout.
        // Để đơn giản ta có thể khởi động lại PauseScene hoặc cập nhật vị trí panel.
        // V2.0: Cập nhật vị trí đơn giản.
        const cx = gameSize.width / 2;
        const cy = gameSize.height / 2;
        this.cameras.main.setScroll(0, 0);
    }

    _createBtn(cx, y, text, callback) {
        const btn = this.add.text(cx, y, text, {
            fontSize: "18px", color: "#ffffff"
        }).setOrigin(0.5).setDepth(103).setInteractive({ useHandCursor: true });

        btn.on("pointerover", () => btn.setColor("#00ffcc").setScale(1.1));
        btn.on("pointerout",  () => btn.setColor("#ffffff").setScale(1));
        btn.on("pointerdown", callback);
    }
}