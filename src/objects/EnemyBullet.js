// ============================================================
// EnemyBullet.js – Đạn của Enemy, object pool
// ============================================================
import Phaser from "phaser";

export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "bulletEnemy");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(9);
        this.disableBody(true, true);
    }

    // --- Bắn thẳng ---

    fire(x, y, damage = 10, speedY = 380) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);
        this.setScale(0.70);
        this.setAngle(0);
        this.setTint(0xffffff);
        this.damage = damage;
        this.bulletType = "normal";
        this.setVelocity(0, speedY);
    }

    // --- Bắn góc (Boss spread shot) ---

    fireAngled(x, y, damage = 10, angleDeg = 90, speed = 360) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);
        this.setScale(0.90);
        this.setAngle(angleDeg - 90);
        this.setTint(0xff6644);
        this.damage = damage;
        this.bulletType = "spread";

        const rad = Phaser.Math.DegToRad(angleDeg);
        this.setVelocity(
            Math.cos(rad) * speed,
            Math.sin(rad) * speed
        );
    }

    // --- Bắn tủa khắp nơi (Boss scatter) ---

    fireScatter(x, y, damage = 8, angleDeg = 0, speed = 300) {
        this.enableBody(true, x, y, true, true);
        this.setActive(true).setVisible(true);
        this.setScale(0.75);
        this.setAngle(angleDeg);
        this.setTint(0xaa00ff); 
        this.damage = damage;
        this.bulletType = "scatter";

        const rad = Phaser.Math.DegToRad(angleDeg);
        this.setVelocity(
            Math.cos(rad) * speed,
            Math.sin(rad) * speed
        );
    }

    // --- preUpdate ---

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active) return;

        const { width, height } = this.scene.scale;
        if (
            this.y > height + 40 ||
            this.y < -40         ||
            this.x < -40         ||
            this.x > width + 40
        ) {
            this.disableBody(true, true);
        }
    }
}