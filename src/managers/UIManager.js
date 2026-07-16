// ============================================================
// UIManager.js – Quản lý giao diện trong GameScene
// ============================================================
import I18n from "../configs/I18nConfig";
import { GAME } from "../configs/GameConfig";
import Phaser from "phaser";


export default class UIManager {

    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.scale;

        // Điểm số
        this.scoreTxt = scene.add.text(10, 10, `${I18n.get("SCORE")}: 0`, {
            fontSize: "18px", color: GAME.COLORS.TEXT_CYAN, fontStyle: "bold"
        }).setDepth(100);

        // Thanh HP người chơi
        this.hpBarBg = scene.add.graphics().setDepth(100);
        this.hpBarFill = scene.add.graphics().setDepth(100);
        
        this.hpBarW = Math.max(150, width * 0.3);
        this.hpBarH = 14;
        this.hpBarX = 10;
        this.hpBarY = 35;

        // Kỹ năng đã nhận
        this.skillsTxt = scene.add.text(10, 55, "", {
            fontSize: "16px"
        }).setDepth(100);

        // Wave Text
        this.waveTxt = scene.add.text(width / 2, 20, "", {
            fontSize: "20px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(100);

        // Nút Pause
        this.pauseBtn = scene.add.text(width - 15, 15, "||", {
            fontSize: "24px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(1, 0).setDepth(100).setInteractive({ useHandCursor: true });

        this.pauseBtn.on("pointerover", () => this.pauseBtn.setColor("#00ffcc"));
        this.pauseBtn.on("pointerout",  () => this.pauseBtn.setColor("#ffffff"));
        this.pauseBtn.on("pointerdown", () => {
            scene.physics.pause();
            scene.paused = true;
            scene.scene.launch(GAME.SCENES.PAUSE);
        });

        // Cảnh báo Boss
        this.warningTxt = scene.add.text(width / 2, height / 2 - 50, I18n.get("WARNING") || "WARNING!", {
            fontSize: "36px", color: "#ff0000", fontStyle: "bold",
            stroke: "#330000", strokeThickness: 8
        }).setOrigin(0.5).setDepth(200).setAlpha(0);

        // Thanh HP Boss (Ẩn mặc định)
        this.bossHpBg = scene.add.graphics().setDepth(100);
        this.bossHpFill = scene.add.graphics().setDepth(100);
        this.bossHpW = width - 80;
        this.bossHpH = 12;
        this.bossHpX = 40;
        this.bossHpY = 60;
        this.isBossActive = false;
        this.currentBoss = null;

        // Lắng nghe sự kiện resize
        scene.scale.on("resize", this.handleResize, this);
        // Đảm bảo event listener được gỡ khi scene tắt
        scene.events.once("shutdown", () => {
            scene.scale.off("resize", this.handleResize, this);
        });
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.hpBarW = Math.max(150, width * 0.3);
        
        if (this.waveTxt) this.waveTxt.setPosition(width / 2, 20);
        if (this.pauseBtn) this.pauseBtn.setPosition(width - 15, 15);
        if (this.warningTxt) this.warningTxt.setPosition(width / 2, height / 2 - 50);

        this.bossHpW = width - 80;
        this.bossHpX = 40;
        
        // Update lại thanh máu người chơi nếu đã khởi tạo
        if (this.scene.player) {
            this.updatePlayerHP(this.scene.player.hp, this.scene.player.maxHp);
        }
    }

    updateScore(score) {
        this.scoreTxt.setText(`${I18n.get("SCORE") || "SCORE"}: ${score}`);
    }

    updateWave(waveNum, isBoss = false) {
        const prefix = I18n.get("WAVE") || "WAVE";
        const bossStr = I18n.get("BOSS") || "BOSS";
        this.waveTxt.setText(isBoss ? `${bossStr}!` : `${prefix} ${waveNum}`);
        if (isBoss) {
            this.waveTxt.setColor("#ff3333");
            this.showBossWarning();
        } else {
            this.waveTxt.setColor("#ffffff");
        }
    }

    updatePlayerHP(hp, maxHp) {
        this.hpBarBg.clear();
        this.hpBarBg.fillStyle(0x330000, 0.8);
        this.hpBarBg.fillRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH, 4);

        const pct = Phaser.Math.Clamp(hp / maxHp, 0, 1);
        this.hpBarFill.clear();
        
        let color = 0x00ffcc; // Xanh
        if (pct < 0.3) color = 0xff0000; // Đỏ
        else if (pct < 0.6) color = 0xffcc00; // Vàng

        this.hpBarFill.fillStyle(color, 1);
        this.hpBarFill.fillRoundedRect(this.hpBarX, this.hpBarY, this.hpBarW * pct, this.hpBarH, 4);
    }

    showBossWarning() {
        this.scene.tweens.add({
            targets: this.warningTxt,
            alpha: 1,
            scale: 1.2,
            duration: 400,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.warningTxt.setAlpha(0);
                this.warningTxt.setScale(1);
            }
        });
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX("sfx_warning");
        }
    }

    bindBoss(boss) {
        this.isBossActive = true;
        this.currentBoss = boss;
    }

    unbindBoss() {
        this.isBossActive = false;
        this.currentBoss = null;
        this.bossHpBg.clear();
        this.bossHpFill.clear();
    }

    update() {
        if (this.scene.player && this.scene.player.acquiredSkills) {
            const skills = this.scene.player.acquiredSkills;
            const txt = skills.map(s => s.icon || s).join(" ");
            this.skillsTxt.setText(txt);
        }

        if (this.isBossActive && this.currentBoss && this.currentBoss.active) {
            this.bossHpBg.clear();
            this.bossHpBg.fillStyle(0x330000, 0.8);
            this.bossHpBg.fillRoundedRect(this.bossHpX, this.bossHpY, this.bossHpW, this.bossHpH, 4);

            const pct = Phaser.Math.Clamp(this.currentBoss.hp / this.currentBoss.maxHp, 0, 1);
            this.bossHpFill.clear();
            this.bossHpFill.fillStyle(0xff0000, 1);
            this.bossHpFill.fillRoundedRect(this.bossHpX, this.bossHpY, this.bossHpW * pct, this.bossHpH, 4);
        } else if (this.isBossActive) {
            // Boss đã chết / bị xóa
            this.unbindBoss();
        }
    }
}