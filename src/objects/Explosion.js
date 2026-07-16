// ============================================================
// Explosion.js – Hiệu ứng nổ (dùng hạt / tween)
// ============================================================
import Phaser from "phaser";

export default class Explosion {
    static spawn(scene, x, y, type = "medium") {
        let size, color, count;
        
        switch (type) {
            case "small":
                size = { min: 2, max: 5 };
                color = [0xffcc00, 0xff6600];
                count = 8;
                break;
            case "large":
                size = { min: 6, max: 15 };
                color = [0xffffff, 0xffcc00, 0xff0000];
                count = 25;
                break;
            case "medium":
            default:
                size = { min: 4, max: 8 };
                color = [0xffcc00, 0xff5500];
                count = 15;
                break;
        }

        const emitter = scene.add.particles(0, 0, "itemExp", {
            x: x,
            y: y,
            speed: { min: 50, max: type === "large" ? 300 : 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: "ADD",
            lifespan: { min: 300, max: type === "large" ? 800 : 500 },
            gravityY: 0,
            quantity: count,
            tint: color
        });

        // Tự hủy sau khi chạy xong
        scene.time.delayedCall(800, () => {
            emitter.destroy();
        });
    }
}