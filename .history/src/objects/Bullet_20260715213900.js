// ============================================================
// Bullet.js – Đạn của Player, dùng object pool
// ============================================================
import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "bulletPlayer");
        this.setDepth(9);
    }

    /** Bắn đạn từ vị trí (x, y) với damage và tốc độ */
    fire(x, y, damage = 20, speedY = -700) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.8);
        this.damage = damage;
        this.body.setVelocityY(speedY);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Recycle khi ra ngoài màn hình
        if (this.y < -20) {
            this.disableBody(true, true);
        }
    }
}
