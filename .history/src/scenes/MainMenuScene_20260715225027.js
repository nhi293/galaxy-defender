// ============================================================
// MainMenuScene.js – Main Menu với 4 buttons: PLAY / PROFILE / SETTINGS / EXIT
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import ParallaxManager from "../objects/ParallaxManager";
import I18n from "../configs/I18nConfig";
import AudioManager from "../managers/AudioManager";

export default class MainMenuScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.MAIN_MENU);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(500);
        this.audioManager = new AudioManager(this);
this.audioManager.playBGM("bgm_menu");

        this.parallaxMgr = new ParallaxManager(this, "bg_menu");

        this._buildDecoration(cx, height);
        this._buildButtons(cx, height);
        this._buildFooter(cx, height);

        // Lắng nghe resize
        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const cx = gameSize.width / 2;
        const height = gameSize.height;

        if (this._line) {
            this._line.clear();
            this._line.lineStyle(1, 0x00ffcc, 0.3);
            this._line.lineBetween(40, 230, gameSize.width - 40, 230);
        }

        if (this._ship) this._ship.setPosition(cx, 130);
        if (this._glow) this._glow.setPosition(cx, 165);
        if (this._title) this._title.setPosition(cx, 210);

        const startY = 290;
        const gap = 66;
        if (this._btnPlay) this._updateButtonPos(this._btnPlay, cx, startY);
        if (this._btnProfile) this._updateButtonPos(this._btnProfile, cx, startY + gap);
        if (this._btnSettings) this._updateButtonPos(this._btnSettings, cx, startY + gap * 2);
        if (this._btnExit) this._updateButtonPos(this._btnExit, cx, startY + gap * 3);

        if (this._footer) this._footer.setPosition(cx, height - 16);

        if (this.parallaxMgr) {
            this.parallaxMgr.handleResize(gameSize);
        }
    }

    _updateButtonPos(btnGroup, cx, y) {
        const { bg, txt, zone } = btnGroup;
        const w = 240, h = 48, r = 8;
        txt.setPosition(cx, y);
        zone.setPosition(cx, y);
        
        bg.clear();
        bg.fillStyle(btnGroup.hover ? 0x1a3a5a : btnGroup.colorBase, btnGroup.fillAlpha);
        bg.fillRoundedRect(cx - w/2, y - h/2, w, h, r);
        bg.lineStyle(2, btnGroup.hover ? btnGroup.colorHov : 0x224455, 1);
        bg.strokeRoundedRect(cx - w/2, y - h/2, w, h, r);
    }

    // --- Decoration ---

    _buildDecoration(cx, height) {
        this._line = this.add.graphics();
        this._line.lineStyle(1, 0x00ffcc, 0.3);
        this._line.lineBetween(40, 230, this.scale.width - 40, 230);
        this._line.setDepth(2);

        this._ship = this.add.image(cx, 130, "player").setScale(1.2).setDepth(5);
        this.tweens.add({ targets: this._ship, angle: 6, duration: 800, yoyo: true, repeat: -1 });

        this._glow = this.add.circle(cx, 165, 18, 0x00aaff, 0.25).setDepth(4);
        this.tweens.add({ targets: this._glow, radius: 28, alpha: 0.10, duration: 600, yoyo: true, repeat: -1 });

        this._title = this.add.text(cx, 210, GAME.TITLE, {
            fontSize: "38px",
            fontStyle: "bold",
            color: GAME.COLORS.TEXT_CYAN,
            stroke: "#003355",
            strokeThickness: 8,
        }).setOrigin(0.5).setDepth(5);

        this.tweens.add({ targets: this._title, scale: 1.04, duration: 1500, yoyo: true, repeat: -1 });
    }

    // --- Buttons ---

    _buildButtons(cx, height) {
        const startY = 290;
        const gap    = 66;

        this._btnPlay = this._createButton(cx, startY,           "▶  " + I18n.get("PLAY"),      () => this._goto(GAME.SCENES.SELECT_STAGE), true);
        this._btnProfile = this._createButton(cx, startY + gap,     "  " + I18n.get("PROFILE"),   () => this._goto(GAME.SCENES.PROFILE));
        this._btnSettings = this._createButton(cx, startY + gap * 2, "  " + I18n.get("SETTINGS"),  () => this._goto(GAME.SCENES.SETTINGS));
        
        // Thêm nút Credits hoặc Exit
        this._btnExit = this._createButton(cx, startY + gap * 3, "✖  " + I18n.get("EXIT"),      () => {
            if (confirm("Thoát game?")) window.close();
        });
    }

    _createButton(cx, y, text, callback, isPrimary = false) {
        const w = 240, h = 48, r = 8;
        const bg = this.add.graphics().setDepth(5);

        const colorBase = isPrimary ? 0x0a2040 : 0x0f1828;
        const colorHov  = isPrimary ? 0x00ffcc : 0x00ffcc;
        const fillAlpha = isPrimary ? 0.9 : 0.7;

        const btnGroup = { bg, txt: null, zone: null, hover: false, colorBase, colorHov, fillAlpha };

        const draw = (hover = false) => {
            btnGroup.hover = hover;
            bg.clear();
            bg.fillStyle(hover ? 0x1a3a5a : colorBase, fillAlpha);
            bg.fillRoundedRect(cx - w/2, y - h/2, w, h, r);
            bg.lineStyle(2, hover ? colorHov : 0x224455, 1);
            bg.strokeRoundedRect(cx - w/2, y - h/2, w, h, r);
        };
        draw(false);

        const txt = this.add.text(cx, y, text, {
            fontSize: isPrimary ? "22px" : "18px",
            color: isPrimary ? "#00ffcc" : "#aabbcc",
            fontStyle: "bold",
        }).setOrigin(0.5).setDepth(6);
        btnGroup.txt = txt;

        const zone = this.add.zone(cx, y, w, h).setInteractive({ useHandCursor: true }).setDepth(10);
        btnGroup.zone = zone;

        zone.on("pointerover", () => {
            draw(true);
            txt.setColor("#ffffff").setScale(1.05);
        });
        zone.on("pointerout", () => {
            draw(false);
            txt.setColor(isPrimary ? "#00ffcc" : "#aabbcc").setScale(1.0);
        });
        zone.on("pointerdown", () => {
            this.tweens.add({
                targets: txt, scale: 0.9, duration: 50, yoyo: true,
                onComplete: callback
            });
        });

        return btnGroup;
    }

    _goto(sceneKey) {
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => this.scene.start(sceneKey));
    }

    _buildFooter(cx, height) {
        this._footer = this.add.text(cx, height - 16, "v2.0.0 © 2026", {
            fontSize: "12px", color: "#445566",
        }).setOrigin(0.5).setDepth(5);
    }

    // --- Update ---

    update(time, delta) {
        if (this.parallaxMgr) {
            this.parallaxMgr.update(delta);
        }
    }
}