// ============================================================
// helpers.js – Các hàm tiện ích dùng chung toàn project
// ============================================================

/**
 * Format số giây thành mm:ss
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

/**
 * Clamp số trong khoảng [min, max]
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Fisher-Yates shuffle – trộn mảng tại chỗ
 * @param {any[]} arr
 * @returns {any[]}
 */
export const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/**
 * Random integer trong [min, max] (inclusive)
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Tính % (0–1)
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
export const pct = (value, total) => (total === 0 ? 0 : value / total);

/**
 * Lerp giữa hai số
 * @param {number} a
 * @param {number} b
 * @param {number} t  0-1
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t;
