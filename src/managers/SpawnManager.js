// ============================================================
// SpawnManager.js – Spawn enemy theo wave definition + difficulty
// ============================================================
import { ENEMY_TYPES } from "../configs/EnemyConfig";
import Phaser from "phaser";

export default class SpawnManager {

    /**
     * @param {Phaser.Scene}               scene
     * @param {Phaser.GameObjects.Group}   enemyGroup
     * @param {Function|null}              onBossSpawn  Callback(enemy) khi boss xuat hien
     */
    constructor(scene, enemyGroup, onBossSpawn = null) {
        this.scene         = scene;
        this.enemyGroup    = enemyGroup;
        this.onBossSpawn   = onBossSpawn;
        this._activeTimers = [];
        this._difficulty   = null;
    }

    // --- Public API ---

    setDifficulty(diff) {
        this._difficulty = diff;
    }

    spawnWave(waveDef) {
        const { enemies, spawnDelay } = waveDef;

        // Flat list roi xao tron (tru boss: spawn rieng dau)
        const normalList = [];
        const bossList   = [];

        for (const entry of enemies) {
            const isBoss = ENEMY_TYPES[entry.type]?.isBoss ?? false;
            for (let i = 0; i < entry.count; i++) {
                (isBoss ? bossList : normalList).push(entry.type);
            }
        }

        // Boss luon spawn truoc, o giua man hinh
        let delay = 300;
        for (const type of bossList) {
            const t = this.scene.time.delayedCall(delay, () => this._spawnBoss(type));
            this._activeTimers.push(t);
            delay += 600;
        }

        // Enemy thuong: xao tron roi spawn
        Phaser.Utils.Array.Shuffle(normalList);
        for (const type of normalList) {
            const t = this.scene.time.delayedCall(delay, () => this._spawnOne(type));
            this._activeTimers.push(t);
            delay += (spawnDelay ?? 800);
        }
    }

    cancelAll() {
        for (const t of this._activeTimers) t.remove(false);
        this._activeTimers = [];
    }

    // --- Private ---

    _spawnOne(type) {
        const enemy = this.enemyGroup.get();
        if (!enemy) return;

        const x = Phaser.Math.Between(44, this.scene.scale.width - 44);
        enemy.spawn(x, -70, type, this._difficulty);
    }

    _spawnBoss(type) {
        const enemy = this.enemyGroup.get();
        if (!enemy) return;

        const cx = this.scene.scale.width / 2;
        // Spawn xa hon ngoai man de boss co thoi gian di chuyen vao
        enemy.spawn(cx, -160, type, this._difficulty);

        if (this.onBossSpawn) this.onBossSpawn(enemy);
    }
}
