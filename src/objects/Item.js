// ============================================================
// Item.js – Vat pham roi ra tu quai (V2.1)
// Co them loai "upgrade" cho ky nang
// ============================================================
import Phaser from "phaser";

export const ITEM_TYPES = {
    heal:    { texture: "itemHp",      color: 0x00ff88, label: "+30 HP",   effect: (p) => p.heal(30) },
    heal_lg: { texture: "itemHp",      color: 0x00ffff, label: "+60 HP",   effect: (p) => p.heal(60) },
    dmg:     { texture: "itemPowerUp", color: 0xffaa00, label: "+DMG",     effect: (p) => { p.damage = Math.floor(p.damage * 1.15); } },
    shield:  { texture: "itemHp",      color: 0x3399ff, label: "SHIELD",   effect: (p) => p.grantShield() },
    rapid:   { texture: "itemPowerUp", color: 0xffcc00, label: "RAPID",    effect: (p) => { p.shootDelay = Math.max(80, p.shootDelay - 25); if (p.scene) p.scene.startAutoShoot(); } },
    spread:  { texture: "itemPowerUp", color: 0xcc00ff, label: "SPREAD",   effect: (p) => { p.bulletSpread = (p.bulletSpread || 0) + 1; } },
    multi:   { texture: "itemPowerUp", color: 0xff66cc, label: "DOUBLE",   effect: (p) => { p.bulletCount = (p.bulletCount || 1) + 1; } },
};

// Drop tables theo loai quai
export const DROP_TABLES = {
    enemy1: ["heal"],
    enemy2: ["heal", "dmg"],
    enemy3: ["heal", "dmg", "rapid"],
    enemy4: ["heal", "dmg", "rapid", "shield"],
    enemy5: ["heal_lg", "dmg", "rapid", "shield", "spread"],
    boss1:  ["heal_lg", "dmg", "shield", "rapid", "spread", "multi"],
    boss2:  ["heal_lg", "heal_lg", "dmg", "shield", "spread", "multi"],
};

export default class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "itemHp");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(15);
        this.disableBody(true, true);
        this._rotateTween = null;
        this._blinkTween = null;
    }

    spawn(x, y, typeKey) {
        this.typeKey = typeKey;
        const cfg = ITEM_TYPES[typeKey] || ITEM_TYPES.heal;

        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);
        this.setTexture(cfg.texture);
        this.setTint(cfg.color);
        this.setScale(1.1);
        this.setAlpha(1);

        // Roi xuong duoi (khong bay len)
        this.setVelocity(Phaser.Math.Between(-30, 30), 90);
        this.setGravityY(40);

        // Xoay nhe
        if (this._rotateTween) this._rotateTween.remove();
        this._rotateTween = this.scene.tweens.add({
            targets: this, angle: 360, duration: 1800, repeat: -1
        });

        // Nhap nhay
        if (this._blinkTween) this._blinkTween.remove();
        this._blinkTween = this.scene.tweens.add({
            targets: this, alpha: 0.45, yoyo: true, repeat: -1, duration: 350
        });
    }

    applyEffect(player) {
        const cfg = ITEM_TYPES[this.typeKey];
        if (cfg && cfg.effect) cfg.effect(player);

        if (this._rotateTween) { this._rotateTween.remove(); this._rotateTween = null; }
        if (this._blinkTween) { this._blinkTween.remove(); this._blinkTween = null; }

        // Floating text
        const label = cfg ? cfg.label : "+HP";
        const color = cfg ? ("#" + cfg.color.toString(16).padStart(6, "0")) : "#fff";
        const txt = this.scene.add.text(this.x, this.y, label, {
            fontSize: "18px", color, fontStyle: "bold",
            stroke: "#000", strokeThickness: 3
        }).setOrigin(0.5).setDepth(30);

        this.scene.tweens.add({
            targets: txt, y: this.y - 45, alpha: 0, duration: 900,
            onComplete: () => txt.destroy()
        });

        this.disableBody(true, true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) return;
        if (this.y > this.scene.scale.height + 60) {
            if (this._rotateTween) { this._rotateTween.remove(); this._rotateTween = null; }
            if (this._blinkTween) { this._blinkTween.remove(); this._blinkTween = null; }
            this.disableBody(true, true);
        }
    }
}
