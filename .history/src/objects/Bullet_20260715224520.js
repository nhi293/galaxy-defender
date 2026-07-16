// ============================================================
// Bullet.js – Đạn của Player, dùng object pool
// ============================================================
import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "bulletPlayer");
        this.setDepth(9);
    }

    /** Bắn đạn thẳng lên từ vị trí (x, y) */
    fire(x, y, damage = 20, speedY = -700) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.8);
        this.setAngle(0);
        this.clearTint();
        this.damage = damage;
        this.body.setVelocityY(speedY);
    }

    /** Bắn đạn theo góc (dùng cho spread shot) */
    fireAngled(x, y, damage = 20, angleDeg = -90, speed = 700) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.8);
        this.setAngle(angleDeg + 90);
        this.clearTint();
        this.damage = damage;

        const rad = Phaser.Math.DegToRad(angleDeg);
        this.body.setVelocity(
            Math.cos(rad) * speed,
            Math.sin(rad) * speed
        );
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Recycle khi ra ngoài màn hình (mọi hướng, vì giờ có đạn bay chéo)
        if (this.y < -20 || this.y > this.scene.scale.height + 20 ||
            this.x < -20 || this.x > this.scene.scale.width + 20) {
            this.disableBody(true, true);
        }
    }
}