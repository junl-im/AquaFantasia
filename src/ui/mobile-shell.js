// Mobile shell extraction target: Kakao in-app, safe viewport, back-exit modal.
export function isKakaoUserAgent(ua = navigator.userAgent) { return /KAKAOTALK/i.test(String(ua)); }
