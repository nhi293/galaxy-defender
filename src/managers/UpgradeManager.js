// ============================================================
// UpgradeManager.js – Logic chọn và áp dụng upgrade
// Không chứa UI. Chỉ xử lý data.
// ============================================================
import { UPGRADES } from "../configs/UpgradeConfig";

export default class UpgradeManager {

    /**
     * Lấy N upgrade ngẫu nhiên mà player CÓ THỂ áp dụng
     * @param {Player} player
     * @param {number} count
     * @returns {object[]}  Mảng upgrade objects
     */
    getRandomUpgrades(player, count = 3) {
        const available = UPGRADES.filter(u => u.canApply(player));

        if (available.length <= count) return available;

        // Fisher-Yates shuffle rồi lấy count phần tử
        const pool = [...available];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, count);
    }

    /**
     * Áp dụng upgrade lên player
     * @param {Player} player
     * @param {object} upgrade
     */
    applyUpgrade(player, upgrade) {
        if (!upgrade?.apply) return;
        upgrade.apply(player);
    }
}
