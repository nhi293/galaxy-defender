// ============================================================
// WaveManager.js – Quan ly Wave (V2.4)
// Fix: Linger enemies tu wave truoc khong duoc phep decrement
//      boss wave's enemiesActive counter
// ============================================================
import Phaser from "phaser";

export default class WaveManager {

    constructor(scene, wavesConfig, baseDifficulty = 1) {
        this.scene          = scene;
        this.waves          = wavesConfig;
        this.baseDifficulty = baseDifficulty;
        this.difficulty     = baseDifficulty;

        this.currentWaveIndex = -1;
        this.enemiesToSpawn   = 0;
        this.enemiesActive    = 0;
        this.enemiesSpawned   = 0;

        this.isSpawning   = false;
        this.isAllCleared = false;

        // Set chua ma dinh danh cua quai trong wave hien tai
        // Moi quai khi spawn duoc gan _waveId, chi quai cung _waveId moi tinh
        this._currentWaveId = 0;

        this._spawnTimer = null;
    }

    startNextWave() {
        if (this.currentWaveIndex >= this.waves.length - 1) {
            this.isAllCleared = true;
            this.scene.events.emit("all-waves-cleared");
            return;
        }

        // Xoa sach quai thuong con sot lai tu wave truoc (tranh bug enemiesActive sai)
        this._cleanLingerers();

        this.currentWaveIndex++;
        this._currentWaveId++;   // Tang waveId moi wave

        const waveCfg = this.waves[this.currentWaveIndex];

        // Tang difficulty 8% moi wave
        this.difficulty = this.baseDifficulty * (1 + this.currentWaveIndex * 0.08);

        this.enemiesToSpawn = waveCfg.count;
        this.enemiesActive  = 0;
        this.isSpawning     = true;

        this.scene.events.emit("wave-started", {
            wave:   this.currentWaveIndex + 1,
            isBoss: !!waveCfg.isBoss
        });

        if (this._spawnTimer) {
            this._spawnTimer.remove();
            this._spawnTimer = null;
        }

        if (waveCfg.isBoss) {
            this._spawnBoss(waveCfg);
        } else {
            const interval = Math.max(280, (waveCfg.spawnInterval || 1200) * (1 / Math.sqrt(this.difficulty)));
            this._spawnTimer = this.scene.time.addEvent({
                delay: interval,
                repeat: this.enemiesToSpawn - 1,
                callback: () => this._spawnEnemy(waveCfg.type)
            });
        }
    }

    // Xoa toan bo quai thuong con song (wave cu con sot)
    _cleanLingerers() {
        const enemies = this.scene.enemies;
        if (!enemies) return;
        enemies.getChildren().forEach(e => {
            if (e.active && !e.isBoss) {
                e._hideHpBar?.();
                e.disableBody(true, true);
            }
        });
    }

    _spawnBoss(waveCfg) {
        const waveId = this._currentWaveId;
        const cx = this.scene.scale.width / 2;
        const e  = this.scene.enemies.get();

        if (!e) {
            // Pool het cho – van coi boss da chet (tranh ket game)
            console.warn("[WaveManager] enemies pool exhausted, skipping boss spawn");
            this.enemiesActive = 0;
            this.enemiesToSpawn = 0;
            this.isSpawning = false;
            this._checkWaveClear(waveId);
            return;
        }

        e.spawn(cx, -120, waveCfg.type, this.difficulty);
        e._waveId = waveId;   // danh dau wave

        this.enemiesActive++;
        this.enemiesSpawned++;
        this.enemiesToSpawn--;
        this.isSpawning = false;
    }

    _spawnEnemy(type) {
        const waveId = this._currentWaveId;
        const w = this.scene.scale.width;
        const x = Phaser.Math.Between(40, w - 40);
        const e = this.scene.enemies.get();

        if (e) {
            e.spawn(x, -50, type, this.difficulty);
            e._waveId = waveId;
        }

        this.enemiesActive++;
        this.enemiesSpawned++;
        this.enemiesToSpawn--;

        if (this.enemiesToSpawn <= 0) {
            this.isSpawning = false;
        }
    }

    // Goi khi quai chet hoac tron
    onEnemyDefeated(enemy) {
        // Chi tinh quai cua wave hien tai
        if (enemy && enemy._waveId !== undefined && enemy._waveId !== this._currentWaveId) {
            return; // Quai cu tu wave truoc – bo qua
        }
        this.enemiesActive = Math.max(0, this.enemiesActive - 1);
        this._checkWaveClear(this._currentWaveId);
    }

    onEnemyEscaped(enemy) {
        // Chi tinh quai cua wave hien tai
        if (enemy && enemy._waveId !== undefined && enemy._waveId !== this._currentWaveId) {
            return; // Quai cu – bo qua
        }
        this.enemiesActive = Math.max(0, this.enemiesActive - 1);
        this._checkWaveClear(this._currentWaveId);
    }

    _checkWaveClear(waveId) {
        // Neu waveId da thay doi, khong lam gi
        if (waveId !== this._currentWaveId) return;
        if (this.isSpawning) return;
        if (this.enemiesToSpawn > 0) return;
        if (this.enemiesActive > 0) return;

        const isBoss = !!(this.waves[this.currentWaveIndex]?.isBoss);
        this.scene.events.emit("wave-cleared", {
            wave:   this.currentWaveIndex + 1,
            isBoss
        });
    }
}
