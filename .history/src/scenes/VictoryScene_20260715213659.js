// ============================================================
// VictoryScene.js – Màn hình chiến thắng
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import I18n from "../configs/I18nConfig";
import StarField from "../objects/StarField";

export default class VictoryScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.VICTORY);
    }

    init(data) {
        this.stageId = data.stageId ?? 1;
        this.score   = data.score ?? 0;
        this.stars   = data.stars ?? 1;
        this.timeSec = data.timeSec ?? 0;
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(400);

        this._starsObj = new StarField(this, 100);

        // Title
        this._titleTxt = this.add.text(cx, cy - 140, I18n.get("VICTORY") || "VICTORY", {
            fontSize: "40px", color: "#00ffcc", fontStyle: "bold",
            stroke: "#005577", strokeThickness: 6
        }).setOrigin(0.5);

        // Stats
        this._scoreTxt = this.add.text(cx, cy - 50, `${I18n.get("SCORE")}: ${this.score}`, {
            fontSize: "24px", color: "#ffffff"
        }).setOrigin(0.5);

        this._timeTxt = this.add.text(cx, cy - 10, `${I18n.get("TIME")}: ${this.timeSec}s`, {
            fontSize: "20px", color: "#aaaaaa"
        }).setOrigin(0.5);

        // Stars
        const starStr = [1, 2, 3].map(n => n <= this.stars ? "★" : "☆").join(" ");
        this._starTxt = this.add.text(cx, cy + 40, starStr, {
            fontSize: "40px", color: "#ffcc00"
        }).setOrigin(0.5);

        // Buttons
        this._btnReplay = this._createBtn(cx - 80, cy + 120, I18n.get("REPLAY"), () => {
            this.scene.start(GAME.SCENES.GAME, { stageId: this.stageId });
        });

        this._btnMenu = this._createBtn(cx + 80, cy + 120, I18n.get("MENU"), () => {
            this.scene.start(GAME.SCENES.MAIN_MENU);
        });

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const cx = gameSize.width / 2;
        const cy = gameSize.height / 2;

        if (this._titleTxt) this._titleTxt.setPosition(cx, cy - 140);
        if (this._scoreTxt) this._scoreTxt.setPosition(cx, cy - 50);
        if (this._timeTxt) this._timeTxt.setPosition(cx, cy - 10);
        if (this._starTxt) this._starTxt.setPosition(cx, cy + 40);
        
        if (this._btnReplay) this._btnReplay.setPosition(cx - 80, cy + 120);
        if (this._btnMenu) this._btnMenu.setPosition(cx + 80, cy + 120);
    }

    _createBtn(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: "18px", color: "#ffffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on("pointerover", () => btn.setColor("#00ffcc").setScale(1.1));
        btn.on("pointerout",  () => btn.setColor("#ffffff").setScale(1));
        btn.on("pointerdown", callback);
    }

    update(time, delta) {
        this._starsObj.update(delta);
    }
}