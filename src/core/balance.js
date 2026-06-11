// Balance helpers planned for extraction from index.html.
export const REGION_TIERS = ['호수','강','항구','심해','용궁','차원의 바다'];
export function readinessLabel(value) { return value >= 95 ? '추천' : value >= 75 ? '도전' : value >= 45 ? '준비중' : '위험'; }
