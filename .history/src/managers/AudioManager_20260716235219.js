// ============================================================
// AudioManager.js – Quản lý âm thanh toàn cầu (singleton-like per game instance)
// ============================================================
import Phaser from "phaser";
import SaveManager from "./SaveManager";
import SFXSynth from "./SFXSynth";

export default class AudioManager {

    static _bgm = null;         // Lưu trữ BGM hiện tại (static để duy trì xuyên suốt)
    static _currentKey = null;  // Lưu key bgm hiện tại để không bật lại nếu đang chạy

    constructor(scene) {
        this.scene = scene;
        const data = SaveManager.getData();
        this.musicVol = data.settings.musicVolume ?? 0.7;
        this.sfxVol   = data.settings.sfxVolume ?? 1.0;
    }

    setVolume(musicV, sfxV) {
        this.musicVol = musicV;
        this.sfxVol = sfxV;

        if (AudioManager._bgm && AudioManager._bgm.isPlaying) {
            AudioManager._bgm.setVolume(Math.min(this.musicVol * 1.4, 1));
        }
    }

    playBGM(key, fade = true) {
        if (AudioManager._currentKey === key && AudioManager._bgm && AudioManager._bgm.isPlaying) {
            // Cập nhật lại volume nhỡ người dùng vặn nhỏ rồi mở lại
            AudioManager._bgm.setVolume(this.musicVol);
            return;
        }

        if (this.musicVol <= 0) return; // Không play nếu volume = 0

        const startNewBgm = () => {
            AudioManager._currentKey = key;
            try {
                if (this.scene.cache.audio.exists(key)) {
                   const bgmVolume = Math.min(this.musicVol * 1.4, 1);

AudioManager._bgm = this.scene.sound.add(key, {
    volume: fade ? 0 : bgmVolume,
    loop: true
});
                    AudioManager._bgm.play();
                    
                    if (fade) {
                        this.scene.tweens.add({
                            targets: AudioManager._bgm,
                            volume: Math.min(this.musicVol * 1.5, 1),
                            duration: 1000
                        });
                    }
                }
            } catch (e) {
                console.error("Error playing BGM:", e);
            }
        };

        if (AudioManager._bgm) {
            if (fade && AudioManager._bgm.isPlaying) {
                this.scene.tweens.add({
                    targets: AudioManager._bgm,
                    volume: 0,
                    duration: 500,
                    onComplete: () => {
                        if (AudioManager._bgm) {
                            AudioManager._bgm.stop();
                            AudioManager._bgm.destroy();
                            AudioManager._bgm = null;
                        }
                        startNewBgm();
                    }
                });
            } else {
                AudioManager._bgm.stop();
                AudioManager._bgm.destroy();
                AudioManager._bgm = null;
                startNewBgm();
            }
        } else {
            startNewBgm();
        }
    }

    playSFX(key, volumeScale = 1) {
        if (this.sfxVol <= 0) return;

        try {
            if (this.scene.cache.audio.exists(key)) {
                this.scene.sound.play(key, { volume: this.sfxVol * volumeScale * 0.5 });
            } else {
                SFXSynth.play(key, this.sfxVol * volumeScale); // ← fallback thay vì chỉ warn
            }
        } catch (e) {
            console.error("Error playing SFX:", e);
            SFXSynth.play(key, this.sfxVol * volumeScale);     // ← fallback khi decode lỗi
        }
    }

    stopBGM() {

    if (!AudioManager._bgm) return;

    AudioManager._bgm.stop();
    AudioManager._bgm.destroy();

    AudioManager._bgm = null;
    AudioManager._currentKey = null;
}

    fadeOutBGM(duration = 1000, key = null) {
        if (!AudioManager._bgm) return;
        if (key && AudioManager._currentKey !== key) return; // Không fade đúng bài thì bỏ qua

        this.scene.tweens.add({
            targets: AudioManager._bgm,
            volume: 0,
            duration: duration,
            onComplete: () => {
                this.stopBGM();
            }
        });
    }

    fadeInBGM(key, duration = 1000) {
        this.playBGM(key);
        if (AudioManager._bgm) {
            AudioManager._bgm.setVolume(0);
            this.scene.tweens.add({
                targets: AudioManager._bgm,
                volume: Math.min(this.musicVol * 1.4, 1),
                duration: duration
            });
        }
    }
}