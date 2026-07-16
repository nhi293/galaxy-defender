import Phaser from "phaser";
import { GAME } from "./configs/GameConfig";
import BootScene        from "./scenes/BootScene";
import PreloadScene     from "./scenes/PreloadScene";
import SplashScene      from "./scenes/SplashScene";
import MainMenuScene    from "./scenes/MainMenuScene";
import SelectStageScene from "./scenes/SelectStageScene";
import TutorialScene    from "./scenes/TutorialScene";
import GameScene        from "./scenes/GameScene";
import UpgradeScene     from "./scenes/UpgradeScene";
import PauseScene       from "./scenes/PauseScene";
import VictoryScene     from "./scenes/VictoryScene";
import GameOverScene    from "./scenes/GameOverScene";
import ProfileScene     from "./scenes/ProfileScene";
import SettingsScene    from "./scenes/SettingsScene";

const config = {
    type: Phaser.AUTO,
    parent: "app",
    width:  GAME.WIDTH,
    height: GAME.HEIGHT,
    backgroundColor: GAME.BACKGROUND,
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "app",
    width: GAME.WIDTH,
    height: GAME.HEIGHT
},
    input: {
        activePointers: 3
    },
    scene: [
        BootScene,
        PreloadScene,
        SplashScene,
        MainMenuScene,
        SelectStageScene,
        TutorialScene,
        GameScene,
        UpgradeScene,
        PauseScene,
        VictoryScene,
        GameOverScene,
        ProfileScene,
        SettingsScene
    ]
};

const game = new Phaser.Game(config);

// Fix AudioContext autoplay policy (mobile + modern browsers)
// Khi nguoi choi tuong tac lan dau, resume AudioContext cua Phaser
const unlockAudio = () => {
    if (game.sound && game.sound.context) {
        const ctx = game.sound.context;
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }
    }
    document.removeEventListener("touchstart", unlockAudio, true);
    document.removeEventListener("touchend",   unlockAudio, true);
    document.removeEventListener("mousedown",  unlockAudio, true);
    document.removeEventListener("keydown",    unlockAudio, true);
};
document.addEventListener("touchstart", unlockAudio, { capture: true, once: true });
document.addEventListener("touchend",   unlockAudio, { capture: true, once: true });
document.addEventListener("mousedown",  unlockAudio, { capture: true, once: true });
document.addEventListener("keydown",    unlockAudio, { capture: true, once: true });