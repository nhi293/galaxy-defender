// ============================================================
// SettingsScene.js – Cài đặt âm thanh / ngôn ngữ / reset
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import SaveManager from "../managers/SaveManager";
import StarField from "../objects/StarField";
import I18n from "../configs/I18nConfig";
import AudioManager from "../managers/AudioManager";

export default class SettingsScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.SETTINGS);
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(GAME.BACKGROUND);
        this.cameras.main.fadeIn(400);

        this._audioMgr = new AudioManager(this);
        if (!AudioManager._bgm?.isPlaying) {
            this._audioMgr.playBGM("bgm_menu");
        }

        this._stars  = new StarField(this, 80, "menu");
        this._data   = SaveManager.getData().settings;

        this._buildHeader(cx);
        this._buildSettings(cx, width, height);
        this._buildBackButton(cx, height);

        this.scale.on("resize", this.handleResize, this);
        this.events.once("shutdown", () => {
            this.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const cx = gameSize.width / 2;
        const height = gameSize.height;

        if (this._header) this._header.setPosition(cx, 44);
        if (this._backBtn) this._backBtn.setPosition(cx, height - 30);
        if (this._resetBtn) this._resetBtn.setPosition(cx, height - 90);
        
        // Căn giữa lại các settings row
        if (this._settingsGroup) {
            let startY = 130;
            this._settingsGroup.forEach((group) => {
                const { bg, txt, barX, barY, barW, barH, fill, item, zone, toggleTxt, panelW } = group;
                bg.clear();
                bg.fillStyle(0x0a1828, 0.7);
                bg.fillRoundedRect(cx - panelW/2, startY - 40, panelW, 70, 8);
                bg.lineStyle(1, 0x224455, 1);
                bg.strokeRoundedRect(cx - panelW/2, startY - 40, panelW, 70, 8);

                txt.setPosition(cx - panelW/2 + 16, startY - 10);

                if (item.type === "slider") {
                    const newBarX = cx + 20;
                    const newBarY = startY - 10;
                    group.barX = newBarX;
                    group.barY = newBarY;
                    
                    group.track.clear();
                    group.track.fillStyle(0x223344, 1);
                    group.track.fillRoundedRect(newBarX, newBarY - barH/2, barW, barH, barH/2);

                    fill.clear();
                    fill.fillStyle(0x00ffcc, 1);
                    fill.fillRoundedRect(newBarX, newBarY - barH/2, barW * item.value, barH, barH/2);

                    zone.setPosition(newBarX + barW/2, newBarY);
                } else if (item.type === "toggle") {
                    toggleTxt.setPosition(cx + 80, startY - 10);
                }
                startY += 90;
            });
        }
    }

    _buildHeader(cx) {
        this._header = this.add.text(cx, 44, `  ${I18n.get("SETTINGS")}`, {
            fontSize: "28px",
            color: GAME.COLORS.TEXT_CYAN,
            fontStyle: "bold",
            stroke: "#003355",
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(5);
    }

    _buildSettings(cx, width, height) {
        const items = [
            { label: `  ${I18n.get("MUSIC_VOL")}`, type: "slider", key: "musicVolume", value: this._data.musicVolume ?? 0.7 },
            { label: `  ${I18n.get("SFX_VOL")}`,   type: "slider", key: "sfxVolume",   value: this._data.sfxVolume ?? 1.0 },
            { label: `  ${I18n.get("LANGUAGE")}`,  type: "toggle", key: "language",    options: ["vi", "en"], value: this._data.language ?? "vi" }
        ];

        let startY = 130;
        this._settingsGroup = [];

        items.forEach((item) => {
            const group = this._createSettingRow(cx, startY, item);
            this._settingsGroup.push(group);
            startY += 90;
        });

        this._createResetBtn(cx, height - 90);
    }

    _createSettingRow(cx, y, item) {
        const panelW = 320;
        const bg = this.add.graphics();
        bg.fillStyle(0x0a1828, 0.7);
        bg.fillRoundedRect(cx - panelW/2, y - 40, panelW, 70, 8);
        bg.lineStyle(1, 0x224455, 1);
        bg.strokeRoundedRect(cx - panelW/2, y - 40, panelW, 70, 8);

        const txt = this.add.text(cx - panelW/2 + 16, y - 10, item.label, {
            fontSize: "16px", color: "#00ffcc"
        }).setOrigin(0, 0.5);

        const group = { bg, txt, item, panelW };

        if (item.type === "slider") {
            const barW = 120, barH = 10;
            const barX = cx + 20, barY = y - 10;
            group.barW = barW; group.barH = barH; group.barX = barX; group.barY = barY;
            
            const track = this.add.graphics();
            track.fillStyle(0x223344, 1);
            track.fillRoundedRect(barX, barY - barH/2, barW, barH, barH/2);
            group.track = track;

            const fill = this.add.graphics();
            group.fill = fill;
            
            const drawFill = (val) => {
                fill.clear();
                fill.fillStyle(0x00ffcc, 1);
                fill.fillRoundedRect(group.barX, group.barY - barH/2, barW * val, barH, barH/2);
            };
            drawFill(item.value);

            const zone = this.add.zone(barX + barW/2, barY, barW, 30).setInteractive({ useHandCursor: true });
            group.zone = zone;
            
            const updateVol = (pointer) => {
                const localX = Phaser.Math.Clamp(pointer.x - group.barX, 0, barW);
                const pct = localX / barW;
                item.value = pct;
                drawFill(pct);
                this._data[item.key] = pct;
                SaveManager.updateSettings(this._data);
                this._audioMgr.setVolume(this._data.musicVolume, this._data.sfxVolume);
            };

            zone.on("pointerdown", updateVol);
            zone.on("pointermove", (ptr) => { if (ptr.isDown) updateVol(ptr); });

        } else if (item.type === "toggle") {
            const btnX = cx + 80, btnY = y - 10;
            const toggleTxt = this.add.text(btnX, btnY, item.value.toUpperCase(), {
                fontSize: "18px", color: "#ffffff", fontStyle: "bold"
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            group.toggleTxt = toggleTxt;

            toggleTxt.on("pointerdown", () => {
                const curIdx = item.options.indexOf(item.value);
                const nxtIdx = (curIdx + 1) % item.options.length;
                item.value = item.options[nxtIdx];
                toggleTxt.setText(item.value.toUpperCase());
                this._data[item.key] = item.value;
                SaveManager.updateSettings(this._data);
                I18n.setLang(item.value);
                
                this.cameras.main.fadeOut(200);
                this.time.delayedCall(200, () => this.scene.restart());
            });
        }
        return group;
    }

    _createResetBtn(cx, y) {
        this._resetBtn = this.add.text(cx, y, I18n.get("RESET_DATA"), {
            fontSize: "16px", color: "#ff4444", fontStyle: "bold"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this._resetBtn.on("pointerover", () => this._resetBtn.setScale(1.1));
        this._resetBtn.on("pointerout",  () => this._resetBtn.setScale(1));
        this._resetBtn.on("pointerdown", () => {
            if (confirm("Reset ALL data?")) {
                SaveManager.resetAll();
                location.reload();
            }
        });
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