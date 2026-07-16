// ============================================================
// StarField.js – Hiệu ứng sao bay (background cuộn phong cách Vũ trụ)
// ============================================================
import Phaser from "phaser";

export default class StarField {

    constructor(scene, count = 100, mode = "game") {
        this.scene = scene;
        this.stars = [];
        this.mode = mode;
        this.nebulas = [];

        const { width, height } = scene.scale;

        // Chọn màu chủ đạo cho màn chơi dựa trên stageId
        // Mặc định là xanh biển, màn 2 cam/nâu, màn 3 lục, màn 4 tím, màn 5 đỏ
        let colorTheme = 0x0a2040; 
        if (scene.stageId === 2) colorTheme = 0x30150a;
        else if (scene.stageId === 3) colorTheme = 0x0a3015;
        else if (scene.stageId === 4) colorTheme = 0x300a30;
        else if (scene.stageId === 5) colorTheme = 0x400a0a;
        else if (scene.stageId === 1) colorTheme = 0x050814;
        
        // Thêm nền màu tĩnh (để bớt đen)
        const bg = scene.add.rectangle(width/2, height/2, width, height, colorTheme, 0.4);
        bg.setDepth(-10);

        // Tạo tinh vân (Nebula) di chuyển chậm
        const numNebulas = 5;
        for (let i = 0; i < numNebulas; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const r = Phaser.Math.Between(100, 300);
            
            const g = scene.add.graphics();
            g.fillStyle(colorTheme, Phaser.Math.FloatBetween(0.1, 0.3));
            g.fillCircle(x, y, r);
            g.setDepth(-5);
            
            this.nebulas.push({
                obj: g,
                x: x, y: y,
                r: r,
                speed: mode === "game" ? Phaser.Math.FloatBetween(10, 30) : Phaser.Math.FloatBetween(2, 5)
            });
        }

        // Tạo sao
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(1, 2.5);
            
            const star = scene.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.8));
            star.setDepth(0);

            const speedBase = mode === "game" ? 150 : 20;
            const speed = speedBase + size * (mode === "game" ? 50 : 10);
            
            this.stars.push({ sprite: star, speed, size });
        }
    }

    update(delta) {
        if (!this.scene || !this.scene.scale) return;
        const dt = delta / 1000;
        const { width, height } = this.scene.scale;

        // Cuộn tinh vân
        for (let n of this.nebulas) {
            n.y += n.speed * dt;
            if (n.y - n.r > height) {
                n.y = -n.r;
                n.x = Phaser.Math.Between(0, width);
            }
            n.obj.clear();
            n.obj.fillCircle(n.x, n.y, n.r);
        }

        // Cuộn sao
        for (let s of this.stars) {
            s.sprite.y += s.speed * dt;
            if (s.sprite.y > height + 10) {
                s.sprite.y = -10;
                s.sprite.x = Phaser.Math.Between(0, width);
            }
        }
    }
}