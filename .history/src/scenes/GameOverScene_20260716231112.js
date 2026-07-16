// ============================================================
// GameOverScene.js – Màn hình thua cuộc
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import I18n from "../configs/I18nConfig";
import AudioManager from "../managers/AudioManager";
import StarField from "../objects/StarField";

export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.GAME_OVER);
    }

    init(data) {
        this.stageId = data.stageId ?? 1;
        this.score   = data.score ?? 0;
        this.wave    = data.wave ?? 1;
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(500);
        this.audioManager = new AudioManager(this);
this.audioManager.playBGM("bgm_gameover");

        this._starsObj = new StarField(this, 100);

        // Title
        this._titleTxt = this.add.text(cx, cy - 100, I18n.get("GAME_OVER"), {
            fontSize: "40px", color: "#ff3333", fontStyle: "bold",
            stroke: "#550000", strokeThickness: 6
        }).setOrigin(0.5);

        // Stats
        this._scoreTxt = this.add.text(cx, cy - 10, `${I18n.get("SCORE")}: ${this.score}`, {
            fontSize: "24px", color: "#ffffff"
        }).setOrigin(0.5);

        this._waveTxt = this.add.text(cx, cy + 30, `${I18n.get("SURVIVED_WAVE")} ${this.wave}`, {
            fontSize: "20px", color: "#aaaaaa"
        }).setOrigin(0.5);

        // Buttons
        const isTutorial = (this.stageId === 0 || this.stageId === "tutorial");
        this._btnRetry = this._createBtn(cx - 80, cy + 120, I18n.get("RETRY"), () => {
            if (isTutorial) {
                this.scene.start(GAME.SCENES.TUTORIAL);
            } else {
                this.scene.start(GAME.SCENES.GAME, { stageId: this.stageId });
            }
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

        if (this._titleTxt) this._titleTxt.setPosition(cx, cy - 100);
        if (this._scoreTxt) this._scoreTxt.setPosition(cx, cy - 10);
        if (this._waveTxt) this._waveTxt.setPosition(cx, cy + 30);
        
        if (this._btnRetry) this._btnRetry.setPosition(cx - 80, cy + 120);
        if (this._btnMenu) this._btnMenu.setPosition(cx + 80, cy + 120);
    }

    _createBtn(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: "18px", color: "#ffffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on("pointerover", () => btn.setColor("#ff3333").setScale(1.1));
        btn.on("pointerout",  () => btn.setColor("#ffffff").setScale(1));
        btn.on("pointerdown", callback);
        return btn;
    }

    update(time, delta) {
        this._starsObj.update(delta);
    }
}