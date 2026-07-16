// ============================================================
// AudioManager.js
// Quản lý toàn bộ BGM + SFX
// ============================================================

import SaveManager from "./SaveManager";
import SFXSynth from "./SFXSynth";

export default class AudioManager {

    static _bgm = null;
    static _currentKey = null;
    static _fadeTween = null;

    constructor(scene) {
        this.scene = scene;

        const data = SaveManager.getData();

        this.musicVol = data.settings.musicVolume ?? 0.7;
        this.sfxVol = data.settings.sfxVolume ?? 1.0;
    }

    // =======================================================
    // Hủy tween đang chạy
    // =======================================================

    _killFadeTween() {

        if (AudioManager._fadeTween) {
            AudioManager._fadeTween.stop();
            AudioManager._fadeTween.remove();
            AudioManager._fadeTween = null;
        }

        if (AudioManager._bgm) {
            this.scene.tweens.killTweensOf(AudioManager._bgm);
        }
    }

    // =======================================================
    // Volume
    // =======================================================

    setVolume(musicV, sfxV) {

        this.musicVol = musicV;
        this.sfxVol = sfxV;

        if (AudioManager._bgm && AudioManager._bgm.isPlaying) {
            AudioManager._bgm.setVolume(Math.min(this.musicVol * 1.4, 1));
        }
    }

    // =======================================================
    // Play BGM
    // =======================================================

    playBGM(key, fade = true) {

        if (
            AudioManager._currentKey === key &&
            AudioManager._bgm &&
            AudioManager._bgm.isPlaying
        ) {
            AudioManager._bgm.setVolume(Math.min(this.musicVol * 1.4, 1));
            return;
        }

        if (this.musicVol <= 0) return;

        const volume = Math.min(this.musicVol * 1.4, 1);

        const startNew = () => {

            try {

                if (!this.scene.cache.audio.exists(key)) {
                    console.warn("Missing audio:", key);
                    return;
                }

                AudioManager._bgm = this.scene.sound.add(key, {
                    loop: true,
                    volume: fade ? 0 : volume
                });

                AudioManager._bgm.play();

                AudioManager._currentKey = key;

                if (fade) {

                    this._killFadeTween();

                    AudioManager._fadeTween = this.scene.tweens.add({

                        targets: AudioManager._bgm,

                        volume,

                        duration: 1000

                    });

                }

            } catch (e) {

                console.error(e);

            }

        };

        if (AudioManager._bgm) {

            this._killFadeTween();

            if (fade && AudioManager._bgm.isPlaying) {

                AudioManager._fadeTween = this.scene.tweens.add({

                    targets: AudioManager._bgm,

                    volume: 0,

                    duration: 500,

                    onComplete: () => {

                        if (AudioManager._bgm) {

                            AudioManager._bgm.stop();

                            AudioManager._bgm.destroy();

                            AudioManager._bgm = null;

                            AudioManager._currentKey = null;

                        }

                        startNew();

                    }

                });

            }

            else {

                if (AudioManager._bgm.isPlaying)
                    AudioManager._bgm.stop();

                AudioManager._bgm.destroy();

                AudioManager._bgm = null;

                AudioManager._currentKey = null;

                startNew();

            }

        }

        else {

            startNew();

        }

    }

    // =======================================================
    // Stop
    // =======================================================

    stopBGM() {

        this._killFadeTween();

        if (!AudioManager._bgm) return;

        if (AudioManager._bgm.isPlaying)
            AudioManager._bgm.stop();

        AudioManager._bgm.destroy();

        AudioManager._bgm = null;

        AudioManager._currentKey = null;

    }

    // =======================================================
    // Fade Out
    // =======================================================

    fadeOutBGM(duration = 1000) {

        if (!AudioManager._bgm) return;

        this._killFadeTween();

        AudioManager._fadeTween = this.scene.tweens.add({

            targets: AudioManager._bgm,

            volume: 0,

            duration,

            onComplete: () => {

                this.stopBGM();

            }

        });

    }

    // =======================================================
    // Fade In
    // =======================================================

    fadeInBGM(key, duration = 1000) {

        this.playBGM(key, false);

        if (!AudioManager._bgm) return;

        this._killFadeTween();

        AudioManager._bgm.setVolume(0);

        AudioManager._fadeTween = this.scene.tweens.add({

            targets: AudioManager._bgm,

            volume: Math.min(this.musicVol * 1.4, 1),

            duration

        });

    }

    // =======================================================
    // SFX
    // =======================================================

    playSFX(key, volumeScale = 1) {

        if (this.sfxVol <= 0) return;

        try {

            if (this.scene.cache.audio.exists(key)) {

                this.scene.sound.play(key, {

                    volume: this.sfxVol * volumeScale * 0.5

                });

            }

            else {

                SFXSynth.play(key, this.sfxVol * volumeScale);

            }

        }

        catch {

            SFXSynth.play(key, this.sfxVol * volumeScale);

        }

    }

}