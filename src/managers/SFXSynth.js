// ============================================================
// SFXSynth.js – Tạo âm thanh SFX bằng Web Audio API
// Không cần file .mp3 – hoàn toàn procedural, nhẹ và nhanh
// ============================================================

export default class SFXSynth {

    static _ctx = null;

    static _getCtx() {
        if (!SFXSynth._ctx || SFXSynth._ctx.state === "closed") {
            SFXSynth._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume nếu bị suspended (autoplay policy)
        if (SFXSynth._ctx.state === "suspended") {
            SFXSynth._ctx.resume();
        }
        return SFXSynth._ctx;
    }

    /**
     * Phát SFX theo tên key và volume (0-1)
     * @param {string} key       – "sfx_shoot"|"sfx_hit"|"sfx_explosion"|"sfx_siren"
     * @param {number} volume    – 0.0 đến 1.0
     */
    static play(key, volume = 0.5) {
        if (volume <= 0) return;
        try {
            const ctx = SFXSynth._getCtx();
            // Resume context nếu bị suspended (autoplay policy)
            if (ctx.state === "suspended") ctx.resume();

            switch (key) {
                case "sfx_shoot":     SFXSynth._shoot(ctx, volume);     break;
                case "sfx_hit":       SFXSynth._hit(ctx, volume);       break;
                case "sfx_explosion": SFXSynth._explosion(ctx, volume); break;
                case "sfx_siren":     SFXSynth._siren(ctx, volume);     break;
                default:              SFXSynth._beep(ctx, volume, 440); break;
            }
        } catch (e) {
            // Web Audio API có thể bị block trên một số browser → bỏ qua
        }
    }

    // ─── Shoot (laser pew) ───────────────────────────────────
    static _shoot(ctx, vol) {
        const osc    = ctx.createOscillator();
        const gain   = ctx.createGain();
        const now    = ctx.currentTime;

        osc.type      = "sawtooth";
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gain.gain.setValueAtTime(vol * 0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    // ─── Hit (impact) ────────────────────────────────────────
    static _hit(ctx, vol) {
        const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.7;
        }

        const src  = ctx.createBufferSource();
        const gain = ctx.createGain();
        const now  = ctx.currentTime;

        src.buffer = buf;
        gain.gain.setValueAtTime(vol * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(now);
    }

    // ─── Explosion (boom) ────────────────────────────────────
    static _explosion(ctx, vol) {
        const dur  = 0.55;
        const buf  = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.5) * 0.9;
        }

        const src  = ctx.createBufferSource();
        const gain = ctx.createGain();
        // Low-pass filter để tạo âm boom trầm
        const lpf  = ctx.createBiquadFilter();
        lpf.type  = "lowpass";
        lpf.frequency.value = 400;

        const now = ctx.currentTime;
        src.buffer = buf;
        gain.gain.setValueAtTime(vol * 0.70, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        src.connect(lpf);
        lpf.connect(gain);
        gain.connect(ctx.destination);
        src.start(now);
    }

    // ─── Siren (boss warning) ────────────────────────────────
    static _siren(ctx, vol) {
        const dur  = 1.8;
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const now  = ctx.currentTime;

        osc.type = "square";
        // Wail từ thấp lên cao rồi xuống × 3
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.4);
        osc.frequency.linearRampToValueAtTime(220, now + 0.8);
        osc.frequency.linearRampToValueAtTime(440, now + 1.2);
        osc.frequency.linearRampToValueAtTime(220, now + 1.6);

        gain.gain.setValueAtTime(vol * 0.18, now);
        gain.gain.setValueAtTime(vol * 0.18, now + dur - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    // ─── Generic beep ────────────────────────────────────────
    static _beep(ctx, vol, freq) {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const now  = ctx.currentTime;

        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }
}
