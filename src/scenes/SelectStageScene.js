// ============================================================
// SelectStageScene.js – Chọn Stage để chơi
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import { STAGES } from "../configs/StageConfig";
import SaveManager from "../managers/SaveManager";
import StarField from "../objects/StarField";
import I18n from "../configs/I18nConfig";

export default class SelectStageScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.SELECT_STAGE);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(400);

        this._stars = new StarField(this, 100);
        this._buildHeader(cx);
        this._buildStageCards(cx, width);
        this._buildBackButton(cx, height);

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const cx = gameSize.width / 2;
        const height = gameSize.height;

        if (this._headerTxt) this._headerTxt.setPosition(cx, 50);
        if (this._headerLine) {
            this._headerLine.clear();
            this._headerLine.lineStyle(1, 0x00ffcc, 0.3);
            this._headerLine.lineBetween(40, 80, gameSize.width - 40, 80);
        }
        if (this._backBtn) this._backBtn.setPosition(cx, height - 30);

        if (this._cardsGroup) {
            const COLS = 2;
            const CARD_W = 200, CARD_H = 110;
            const GAP_X = 20, GAP_Y = 18;
            const totalW = (CARD_W * COLS) + (GAP_X * (COLS - 1));
            const startX = cx - (totalW / 2) + (CARD_W / 2);
            const startY = 150;

            this._cardsGroup.forEach((cData, index) => {
                const r = Math.floor(index / COLS);
                const c = index % COLS;
                const x = startX + c * (CARD_W + GAP_X);
                const y = startY + r * (CARD_H + GAP_Y);

                cData.x = x; cData.y = y;
                cData.drawCard(false);

                if (cData.titleTxt) cData.titleTxt.setPosition(x, y - 20);
                if (cData.lblTxt) cData.lblTxt.setPosition(x - CARD_W/2 + 8, y - CARD_H/2 + 6);
                if (cData.starTxt) cData.starTxt.setPosition(x, y + 16);
                if (cData.zone) cData.zone.setPosition(x, y);
                if (cData.lockedTxt) cData.lockedTxt.setPosition(x, y + 15);
            });
        }
    }

    // --- Header ---

    _buildHeader(cx) {
        this._headerTxt = this.add.text(cx, 50, I18n.get("SELECT_STAGE"), {
            fontSize: "30px",
            fontStyle: "bold",
            color: GAME.COLORS.TEXT_CYAN,
            stroke: "#003355",
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(5);

        this._headerLine = this.add.graphics().setDepth(5);
        this._headerLine.lineStyle(1, 0x00ffcc, 0.3);
        this._headerLine.lineBetween(40, 80, this.scale.width - 40, 80);
    }

    // --- Stage Cards ---

    _buildStageCards(cx, width) {
        const stageIds  = [0, 1, 2, 3, 4, 5]; // Tutorial = 0
        const CARD_W    = 200;
        const CARD_H    = 110;
        const COLS      = 2;
        const GAP_X     = 20;
        const GAP_Y     = 18;
        
        const totalW = (CARD_W * COLS) + (GAP_X * (COLS - 1));
        const startX = cx - (totalW / 2) + (CARD_W / 2);
        const startY = 150;

        let unlockedMax = SaveManager.getData().unlockedStage;
        // SaveManager gio luu so (0-5), "tutorial" -> 0 da duoc xu ly o saveVictory
        if (unlockedMax === "tutorial") unlockedMax = 0;
        unlockedMax = parseInt(unlockedMax, 10);
        if (isNaN(unlockedMax)) unlockedMax = 0;
        
        const bestStars = SaveManager.getData().stageStars ?? {};

        this._cardsGroup = [];

        stageIds.forEach((id, index) => {
            const isUnlocked = (index <= unlockedMax);
            const r = Math.floor(index / COLS);
            const c = index % COLS;
            const x = startX + c * (CARD_W + GAP_X);
            const y = startY + r * (CARD_H + GAP_Y);

            const cData = this._createCard(x, y, CARD_W, CARD_H, id, isUnlocked, bestStars[id]);
            this._cardsGroup.push(cData);
        });
    }

    _createCard(x, y, w, h, id, isUnlocked, stars) {
        const bg = this.add.graphics().setDepth(5);
        const R = 10;
        const cfg = STAGES[id];
        let stageName = cfg ? cfg.name : `Stage ${id}`;
        
        // I18n logic
        if (id === 0) stageName = "TUTORIAL";
        else if (id === 5) stageName = "FINAL BOSS";
        else stageName = `${I18n.get("STAGE")} ${id}`;

        const cData = { bg, x, y, w, h };

        const drawCard = (hover = false) => {
            bg.clear();
            if (!isUnlocked) {
                bg.fillStyle(0x1a2a3a, 0.6);
                bg.fillRoundedRect(cData.x - w/2, cData.y - h/2, w, h, R);
                bg.lineStyle(2, 0x334455, 1);
            } else {
                bg.fillStyle(hover ? 0x0a3050 : 0x0a2040, 0.9);
                bg.fillRoundedRect(cData.x - w/2, cData.y - h/2, w, h, R);
                bg.lineStyle(2, hover ? 0x00ffcc : 0x00aa88, 1);
            }
            bg.strokeRoundedRect(cData.x - w/2, cData.y - h/2, w, h, R);
        };

        cData.drawCard = drawCard;
        drawCard(false);

        // Stage Title
        const titleColor = isUnlocked ? GAME.COLORS.TEXT_CYAN : "#556677";
        cData.titleTxt = this.add.text(x, y - 20, stageName, {
            fontSize: "18px", color: titleColor, fontStyle: "bold"
        }).setOrigin(0.5).setDepth(6);

        // Level Number (Top-Left)
        const lbl = id === 0 ? "TR" : `L${id}`;
        cData.lblTxt = this.add.text(x - w/2 + 8, y - h/2 + 6, lbl, {
            fontSize: "14px", color: isUnlocked ? "#00ffcc" : "#445566", fontStyle: "bold"
        }).setOrigin(0).setDepth(6);

        if (isUnlocked) {
            const starCount = stars ?? 0;
            const starStr = [1,2,3].map(n => n <= starCount ? "★" : "☆").join(" ");
            cData.starTxt = this.add.text(x, y + 16, starStr, {
                fontSize: "20px", color: starCount > 0 ? "#ffcc00" : "#556677"
            }).setOrigin(0.5).setDepth(6);

            const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(10);
            cData.zone = zone;
            zone.on("pointerover", () => drawCard(true));
            zone.on("pointerout",  () => drawCard(false));
            zone.on("pointerdown", () => {
                this.cameras.main.fadeOut(300);
                this.time.delayedCall(300, () => {
                    if (id === 0) {
                        this.scene.start(GAME.SCENES.TUTORIAL);
                    } else {
                        this.scene.start(GAME.SCENES.GAME, { stageId: id });
                    }
                });
            });
        } else {
            cData.lockedTxt = this.add.text(x, y + 15, I18n.get("LOCKED"), {
                fontSize: "16px", color: "#aa4444", fontStyle: "bold"
            }).setOrigin(0.5).setDepth(6);
        }

        return cData;
    }

    // --- Back Button ---

    _buildBackButton(cx, height) {
        this._backBtn = this.add.text(cx, height - 30, "⬅ " + I18n.get("BACK"), {
            fontSize: "18px",
            color: "#557788",
            fontStyle: "bold",
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