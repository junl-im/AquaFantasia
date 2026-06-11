// Fishing system extraction target.
export function calculateTensionRisk(readiness = 100) { return Math.max(0, 100 - Number(readiness || 0)); }
