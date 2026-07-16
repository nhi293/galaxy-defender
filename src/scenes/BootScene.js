// ============================================================
// BootScene.js – Scene khởi động đầu tiên
// ============================================================
import Phaser from "phaser";
import { GAME } from "../configs/GameConfig";

export default class BootScene extends Phaser.Scene {

    constructor() {
        super(GAME.SCENES.BOOT);
    }

    create() {
        this.scene.start(GAME.SCENES.PRELOAD);
    }
}
