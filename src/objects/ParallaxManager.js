// ============================================================
// ParallaxManager.js – Quản lý hình nền cuộn (Parallax)
// ============================================================
import Phaser from "phaser";
import StarField from "./StarField";

export default class ParallaxManager {

    constructor(scene, bgKey) {
        this.scene = scene;
        this.bgKey = bgKey;

        const { width, height } = scene.scale;

        // TileSprite nền dưới cùng, cuộn rất chậm
        this.bgLayer = scene.add.tileSprite(width / 2, height / 2, width, height, bgKey);
        this.bgLayer.setDepth(-20);

        // Chỉnh scale để TileSprite cover vừa màn hình
        this._updateBgScale(width, height);

        // Lớp StarField bên trên nền ảnh tĩnh, cuộn nhanh hơn
        this.starField = new StarField(scene, 80, "game");
        
        // Nếu StarField sinh ra bg màu tĩnh, ta nên ẩn nó hoặc tắt đi
        // StarField.js hiện đang tạo 1 rectangle đen xì. Ta sẽ hack nhẹ để ẩn nó.
        // Hoặc truyền flag, nhưng ta chưa sửa StarField, tạm thời cứ để vậy vì 
        // rectangle trong StarField có alpha = 0.4, tạo độ tối cho background, khá hợp.
    }

    _updateBgScale(width, height) {
        if (!this.bgLayer) return;

        const imgFrame = this.scene.textures.getFrame(this.bgKey, "__BASE");
        if (!imgFrame) return;

        const imgW = imgFrame.width;
        const imgH = imgFrame.height;

        // Tính tỉ lệ để ảnh phủ kín toàn bộ màn hình
        const scaleX = width / imgW;
        const scaleY = height / imgH;
        const scale = Math.max(scaleX, scaleY);

        this.bgLayer.setSize(width / scale, height / scale);
        this.bgLayer.setScale(scale);
        this.bgLayer.setPosition(width / 2, height / 2);
    }

    update(delta) {
        const dt = delta / 1000;
        
        // Cuộn ảnh nền chậm (VD: 30 pixels/s)
        if (this.bgLayer) {
            this.bgLayer.tilePositionY -= 30 * dt;
        }

        // Cập nhật các lớp khác
        if (this.starField) {
            this.starField.update(delta);
        }
    }

    handleResize(gameSize) {
        const { width, height } = gameSize;
        this._updateBgScale(width, height);
    }
}
