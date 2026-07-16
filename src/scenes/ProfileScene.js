// ============================================================
// ProfileScene.js – Trang hồ sơ người chơi
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import SaveManager from "../managers/SaveManager";
import StarField from "../objects/StarField";
import I18n from "../configs/I18nConfig";

export default class ProfileScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.PROFILE);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(400);

        this._stars = new StarField(this, 80);

        const data = SaveManager.getData();

        this._buildHeader(cx);
        this._buildAvatar(cx, data);
        this._buildStats(cx, data);
        this._buildBackButton(cx, height);

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const cx = gameSize.width / 2;
        const height = gameSize.height;

        if (this._headerTxt) this._headerTxt.setPosition(cx, 40);
        
        if (this._avatarGroup) {
            this._avatarGroup.gfx.clear();
            this._avatarGroup.gfx.fillStyle(0x0a2040, 1);
            this._avatarGroup.gfx.fillCircle(cx, 120, 44);
            this._avatarGroup.gfx.lineStyle(2, 0x00ffcc, 0.8);
            this._avatarGroup.gfx.strokeCircle(cx, 120, 44);

            this._avatarGroup.avatarTxt.setPosition(cx, 120);
            this._avatarGroup.rankTxt.setPosition(cx, 185);
        }

        if (this._statsGroup) {
            const panelW = 300, panelH = 150;
            const startY = 240;

            this._statsGroup.bg.clear();
            this._statsGroup.bg.fillStyle(0x051020, 0.8);
            this._statsGroup.bg.fillRoundedRect(cx - panelW/2, startY, panelW, panelH, 12);
            this._statsGroup.bg.lineStyle(1.5, 0x224455, 1);
            this._statsGroup.bg.strokeRoundedRect(cx - panelW/2, startY, panelW, panelH, 12);

            this._statsGroup.texts.forEach((txt, i) => {
                txt.setPosition(cx - panelW/2 + 20, startY + 25 + i * 30);
            });
        }

        if (this._backBtn) this._backBtn.setPosition(cx, height - 30);
    }

    _buildHeader(cx) {
        this._headerTxt = this.add.text(cx, 40, I18n.get("PROFILE"), {
            fontSize: "28px",
            color: GAME.COLORS.TEXT_CYAN,
            fontStyle: "bold",
            stroke: "#003355",
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(5);
    }

    _buildAvatar(cx, data) {
        const gfx = this.add.graphics().setDepth(5);
        gfx.fillStyle(0x0a2040, 1);
        gfx.fillCircle(cx, 120, 44);
        gfx.lineStyle(2, 0x00ffcc, 0.8);
        gfx.strokeCircle(cx, 120, 44);

        const avatarTxt = this.add.text(cx, 120, "", { fontSize: "36px" }).setOrigin(0.5).setDepth(6);

        let stageStr = data.unlockedStage;
        if (stageStr === "tutorial" || stageStr === 0) stageStr = "Tutorial";
        else stageStr = `${I18n.get("STAGE")} ${stageStr}`;
        
        const rankTxt = this.add.text(cx, 185, `${I18n.get("RANK")}: ${stageStr}`, {
            fontSize: "18px", color: "#00ffcc", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(5);

        this._avatarGroup = { gfx, avatarTxt, rankTxt };
    }

    _buildStats(cx, data) {
        const panelW = 300, panelH = 150;
        const startY = 240;

        const bg = this.add.graphics().setDepth(5);
        bg.fillStyle(0x051020, 0.8);
        bg.fillRoundedRect(cx - panelW/2, startY, panelW, panelH, 12);
        bg.lineStyle(1.5, 0x224455, 1);
        bg.strokeRoundedRect(cx - panelW/2, startY, panelW, panelH, 12);

        let totalScore = 0;
        let totalEnemies = 0;
        let totalTime = 0;
        let totalStars = 0;

        if (data.history) {
            data.history.forEach(h => {
                totalScore += h.score || 0;
                totalEnemies += h.enemiesKilled || 0;
                totalTime += h.timeSec || 0;
            });
        }
        
        if (data.stageStars) {
            Object.values(data.stageStars).forEach(v => totalStars += v);
        }

        const lines = [
            `${I18n.get("TOTAL_SCORE")}: ${totalScore}`,
            `${I18n.get("ENEMIES_KILLED")}: ${totalEnemies}`,
            `${I18n.get("PLAY_TIME")}: ${totalTime}s`,
            `${I18n.get("TOTAL_STARS")}: ${totalStars} ★`
        ];

        const texts = [];
        lines.forEach((str, i) => {
            const t = this.add.text(cx - panelW/2 + 20, startY + 25 + i * 30, str, {
                fontSize: "16px", color: "#aabbcc"
            }).setOrigin(0, 0.5).setDepth(6);
            texts.push(t);
        });

        this._statsGroup = { bg, texts };
    }

    _buildBackButton(cx, height) {
        this._backBtn = this.add.text(cx, height - 30, "⬅ " + I18n.get("BACK"), {
            fontSize: "18px", color: "#557788", fontStyle: "bold",
        }).setOrigin(0.5).setDepth(6).setInteractive({ useHandCursor: true });

        this._backBtn.on("pointerover", () => this._backBtn.setColor("#00ffcc"));
        this._backBtn.on("pointerout",  () => this._backBtn.setColor("#557788"));
        this._backBtn.on("pointerdown", () => {
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => this.scene.start(GAME.SCENES.MAIN_MENU));
        });
    }

    update(time, delta) {
        this._stars.update(delta);
    }
}