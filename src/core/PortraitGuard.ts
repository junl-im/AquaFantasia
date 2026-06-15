export type PortraitViewportMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  appWidth: number;
  appHeight: number;
  physicalLandscape: boolean;
  kakaoInApp: boolean;
  hostileInApp: boolean;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function isKakaoInAppBrowser(): boolean {
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|KakaoTalk|KAKAOSTORY|KAKAOBIZ/i.test(ua);
}

export function isHostileInAppBrowser(): boolean {
  const ua = navigator.userAgent || '';
  return isKakaoInAppBrowser() || /Instagram|FBAN|FBAV|Line\/|NAVER|DaumApps|WhaleInApp/i.test(ua);
}

export function getPortraitViewportMetrics(): PortraitViewportMetrics {
  const viewportWidth = Math.max(1, Math.floor(window.visualViewport?.width ?? window.innerWidth));
  const viewportHeight = Math.max(1, Math.floor(window.visualViewport?.height ?? window.innerHeight));
  const physicalLandscape = viewportWidth > viewportHeight;
  const kakaoInApp = isKakaoInAppBrowser();
  const hostileInApp = isHostileInAppBrowser();

  // Aqua Fantasia is a portrait-only mobile game.
  // Some in-app browsers ignore manifest orientation and browser orientation API.
  // When the physical viewport becomes landscape, keep rendering a portrait game shell
  // inside the landscape viewport instead of switching UI layout.
  const maxPortraitWidth = hostileInApp ? 430 : 480;
  const minUsableWidth = Math.min(340, viewportWidth);
  const appWidth = physicalLandscape
    ? clamp(Math.floor(viewportHeight * 0.78), Math.min(280, viewportWidth), Math.min(maxPortraitWidth, viewportWidth))
    : Math.min(viewportWidth, maxPortraitWidth);
  const appHeight = viewportHeight;

  return {
    viewportWidth,
    viewportHeight,
    appWidth: Math.max(minUsableWidth, appWidth),
    appHeight,
    physicalLandscape,
    kakaoInApp,
    hostileInApp,
  };
}

export function applyPortraitViewportMetrics(): PortraitViewportMetrics {
  const metrics = getPortraitViewportMetrics();
  const root = document.documentElement;
  root.style.setProperty('--viewport-width', `${metrics.viewportWidth}px`);
  root.style.setProperty('--viewport-height', `${metrics.viewportHeight}px`);
  root.style.setProperty('--app-width', `${metrics.appWidth}px`);
  root.style.setProperty('--app-height', `${metrics.appHeight}px`);
  root.style.setProperty('--portrait-width', `${metrics.appWidth}px`);
  root.style.setProperty('--portrait-height', `${metrics.appHeight}px`);
  root.dataset.currentOrientation = 'portrait';
  root.dataset.orientationPolicy = 'hard-portrait';
  root.dataset.displayMode = window.matchMedia('(display-mode: fullscreen)').matches
    ? 'fullscreen'
    : window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : 'browser';
  root.classList.toggle('is-physical-landscape', metrics.physicalLandscape);
  root.classList.toggle('is-kakao-inapp', metrics.kakaoInApp);
  root.classList.toggle('is-hostile-inapp', metrics.hostileInApp);
  return metrics;
}

export function installPortraitCssGuards(): void {
  const sync = () => {
    applyPortraitViewportMetrics();
  };
  sync();
  window.visualViewport?.addEventListener('resize', sync, { passive: true });
  window.visualViewport?.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('orientationchange', sync, { passive: true });
  window.addEventListener('pageshow', sync, { passive: true });
  document.addEventListener('visibilitychange', sync, { passive: true });
  document.addEventListener('fullscreenchange', sync, { passive: true });
}


export async function requestHardPortraitLock(): Promise<'css-portrait' | 'inapp-css-only'> {
  const metrics = applyPortraitViewportMetrics();

  // v8.6.0 Kakao hard-safe policy:
  // Do not call browser fullscreen API and do not call browser orientation API.
  // KakaoTalk/WebView may show a system fullscreen message and then rotate the viewport
  // when those APIs are requested. Aqua Fantasia now keeps the game portrait by CSS
  // viewport metrics only, so user taps/back gestures never trigger a fullscreen prompt.
  const root = document.documentElement;
  root.dataset.fullscreenApi = 'disabled';
  root.dataset.orientationApi = 'disabled';
  root.dataset.immersiveMode = metrics.hostileInApp ? 'inapp-css-only' : 'css-immersive';
  applyPortraitViewportMetrics();
  return metrics.hostileInApp ? 'inapp-css-only' : 'css-portrait';
}
