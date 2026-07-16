// ============================================================
// DifficultyConfig.js – Cấu hình độ khó
// ============================================================

export function getDifficulty(stageId) {
    if (stageId === "tutorial") return 0.3;
    
    // Mỗi stage tăng nhẹ chỉ số quái (máu, tốc độ bắn...)
    // stageId từ 1 đến 5
    const base = 1.0;
    const increment = 0.2; 
    
    const sid = parseInt(stageId, 10);
    if (!isNaN(sid)) {
        return base + (sid - 1) * increment;
    }
    return base;
}