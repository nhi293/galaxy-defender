// ============================================================
// GameConfig.js – Cấu hình toàn cục (V2.0)
// ============================================================

export const GAME = {
    // Độ phân giải cơ sở (ảo), RESIZE mode sẽ override thực tế
    WIDTH: 480,
    HEIGHT: 800,
    TITLE: "Galaxy Defender V2",
    BACKGROUND: "#050816",
    VERSION: "2.0.0",
    FONT: "'Orbitron', 'Rajdhani', sans-serif",
    FONT_BODY: "'Rajdhani', sans-serif",

    SCENES: {
        BOOT: "BootScene",
        PRELOAD: "PreloadScene",
        SPLASH: "SplashScene",
        MAIN_MENU: "MainMenuScene",
        SELECT_STAGE: "SelectStageScene",
        TUTORIAL: "TutorialScene",
        GAME: "GameScene",
        UPGRADE: "UpgradeScene",
        PAUSE: "PauseScene",
        VICTORY: "VictoryScene",
        GAME_OVER: "GameOverScene",
        PROFILE: "ProfileScene",
        SETTINGS: "SettingsScene",
    },

    COLORS: {
        PRIMARY: 0x00ffcc,
        SECONDARY: 0x0088ff,
        DANGER: 0xff3333,
        WARNING: 0xffcc00,
        SUCCESS: 0x00ff88,
        DARK: 0x050816,
        PANEL: 0x0a1628,
        BORDER: 0x1e3a5f,
        TEXT_WHITE: "#ffffff",
        TEXT_CYAN: "#00ffcc",
        TEXT_YELLOW: "#ffcc00",
        TEXT_RED: "#ff3333",
        TEXT_GREEN: "#00ff88",
    },

    WORLD_BOUNDS_PADDING: 50,
    MAX_STARS: 3,
    TOTAL_STAGES: 5,
};