// ============================================================
// UpgradeScene.js – Popup nang cap (V2.4 – Fixed icon layout)
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";
import I18n from "../configs/I18nConfig";
import { getRandomUpgrades } from "../configs/UpgradeConfig";

export default class UpgradeScene extends Phaser.Scene {

    constructor() {
        super({ key: GAME.SCENES.UPGRADE, active: false });
    }

    init(data) {
        this.onChosen = data.onComplete ?? (() => {});
    }

    create() {
        const { width, height } = this.scale;
        const cx = width  / 2;
        const cy = height / 2;

        this.cameras.main.fadeIn(220);

        // Dim overlay
        this._dimOverlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.72).setDepth(300);

        // Panel
        const PW = Math.min(360, width - 24);
        const PH = 490;
        this._pw = PW; this._ph = PH;

        this._panelGfx = this.add.graphics().setDepth(301);
        this._drawPanel(cx, cy, PW, PH);

        // Title
        this._titleTxt = this.add.text(cx, cy - PH / 2 + 38, `+ ${I18n.get("LEVEL_UP")}`, {
            fontSize: "26px", color: GAME.COLORS.TEXT_CYAN, fontStyle: "bold"
        }).setOrigin(0.5).setDepth(302);

        this._subTxt = this.add.text(cx, cy - PH / 2 + 67, I18n.get("CHOOSE_ABILITY"), {
            fontSize: "13px", color: "#aaaaaa"
        }).setOrigin(0.5).setDepth(302);

        // Cards
        const options = getRandomUpgrades(3);
        this._cards  = [];
        options.forEach((opt, i) => {
            const card = this._createCard(cx, cy - 70 + i * 98, PW - 40, opt);
            this._cards.push(card);
        });

        // Skip button
        this._skipTxt = this.add.text(cx, cy + PH / 2 - 30, I18n.get("SKIP"), {
            fontSize: "15px", color: "#556677", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(302).setInteractive({ useHandCursor: true });

        this._skipTxt.on("pointerover", () => this._skipTxt.setColor("#ffffff"));
        this._skipTxt.on("pointerout",  () => this._skipTxt.setColor("#556677"));
        this._skipTxt.on("pointerdown", () => this._choose(null));

        this.scale.on("resize", this._onResize, this);
        this.events.once("shutdown", () => this.scale.off("resize", this._onResize, this));
    }

    _drawPanel(cx, cy, pw, ph) {
        this._panelGfx.clear()
            .fillStyle(0x060e22, 0.97)
            .fillRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 14)
            .lineStyle(1.5, 0x00ffcc, 0.7)
            .strokeRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 14);
    }

    _createCard(cx, cy, cardW, upgrade) {
        const CH = 84;
        const ICON_BOX = 54;   // width cua o icon ben trai
        const borderCol = Phaser.Display.Color.HexStringToColor(upgrade.color || "#00ffcc").color;

        const bg   = this.add.graphics().setDepth(302);
        const drawBg = (hovered) => {
            bg.clear()
              .fillStyle(hovered ? 0x0a2560 : 0x0a1530, 0.93)
              .fillRoundedRect(cx - cardW / 2, cy - CH / 2, cardW, CH, 10)
              .lineStyle(1.5, borderCol, 0.85)
              .strokeRoundedRect(cx - cardW / 2, cy - CH / 2, cardW, CH, 10);
        };
        drawBg(false);

        // Icon box (vuong ben trai)
        const iconBg = this.add.graphics().setDepth(303);
        const drawIconBg = () => {
            iconBg.clear()
              .fillStyle(borderCol, 0.18)
              .fillRoundedRect(cx - cardW / 2 + 6, cy - 22, ICON_BOX, 44, 8);
        };
        drawIconBg();

        // Icon text – can giua o icon
        const iconTxt = this.add.text(
            cx - cardW / 2 + 6 + ICON_BOX / 2,
            cy,
            upgrade.icon ?? "+",
            { fontSize: "20px", color: upgrade.color ?? "#ffffff", fontStyle: "bold" }
        ).setOrigin(0.5).setDepth(304);

        // Label & Desc – ben phai icon
        const textX = cx - cardW / 2 + ICON_BOX + 16;
        const textW = cardW - ICON_BOX - 22;

        const labelTxt = this.add.text(textX, cy - 16, I18n.get(upgrade.labelKey), {
            fontSize: "16px", color: upgrade.color ?? "#00ffcc", fontStyle: "bold",
            wordWrap: { width: textW }
        }).setOrigin(0, 0.5).setDepth(304);

        const descTxt = this.add.text(textX, cy + 16, I18n.get(upgrade.descKey), {
            fontSize: "12px", color: "#aabbcc",
            wordWrap: { width: textW }
        }).setOrigin(0, 0.5).setDepth(304);

        // Interactive zone
        const zone = this.add.zone(cx, cy, cardW, CH)
            .setInteractive({ useHandCursor: true }).setDepth(305);

        zone.on("pointerover", () => drawBg(true));
        zone.on("pointerout",  () => drawBg(false));
        zone.on("pointerdown", () => this._choose(upgrade));

        return { bg, iconBg, iconTxt, labelTxt, descTxt, zone, drawBg, drawIconBg, cx, cy, cardW };
    }

    _onResize(gameSize) {
        const cx  = gameSize.width  / 2;
        const cy  = gameSize.height / 2;
        const PW  = Math.min(360, gameSize.width - 24);
        const PH  = this._ph;

        this._dimOverlay?.setPosition(cx, cy).setSize(gameSize.width, gameSize.height);
        this._drawPanel(cx, cy, PW, PH);
        this._titleTxt?.setPosition(cx, cy - PH / 2 + 38);
        this._subTxt?.setPosition(cx, cy - PH / 2 + 67);
        this._skipTxt?.setPosition(cx, cy + PH / 2 - 30);

        this._cards?.forEach((card, i) => {
            const newCy  = cy - 70 + i * 98;
            const newCW  = PW - 40;
            const ICON_BOX = 54;
            const textX    = cx - newCW / 2 + ICON_BOX + 16;

            card.bg.clear()
                .fillStyle(0x0a1530, 0.93)
                .fillRoundedRect(cx - newCW / 2, newCy - 42, newCW, 84, 10);

            card.iconBg.clear()
                .fillStyle(0x003333, 0.25)
                .fillRoundedRect(cx - newCW / 2 + 6, newCy - 22, ICON_BOX, 44, 8);

            card.iconTxt.setPosition(cx - newCW / 2 + 6 + ICON_BOX / 2, newCy);
            card.labelTxt.setPosition(textX, newCy - 16);
            card.descTxt.setPosition(textX, newCy + 16);
            card.zone.setPosition(cx, newCy).setSize(newCW, 84);
        });
    }

    _choose(upgrade) {
        this.cameras.main.fadeOut(180);
        this.time.delayedCall(180, () => {
            this.scene.stop();
            this.onChosen(upgrade ? upgrade.id : null);
        });
    }
}