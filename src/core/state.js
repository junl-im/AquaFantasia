// AquaFantasia v3.6 modular scaffold
// Runtime still uses index.html for compatibility. Move state helpers here gradually.
export const SAVE_KEYS = ['aqua_v3.6','aqua_v3.5','aqua_v3.4','aqua_v3.3','aqua_v3.2'];
export function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
