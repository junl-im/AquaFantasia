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
  // Some in-app browsers ignore manifest orientation and screen.orientation.lock().
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
}

export async function requestHardPortraitLock(): Promise<'locked' | 'fullscreen-only' | 'css-fallback' | 'inapp-css-only'> {
  const metrics = applyPortraitViewportMetrics();

  // KakaoTalk and several in-app browsers may ignore or mishandle the Fullscreen API
  // and screen.orientation.lock(). In those shells, requesting fullscreen can itself
  // trigger a viewport/orientation jump. Aqua Fantasia therefore uses a CSS-only
  // portrait game cage in hostile in-app browsers and never calls fullscreen or lock.
  if (metrics.hostileInApp) {
    document.documentElement.dataset.immersiveMode = 'inapp-css-only';
    return 'inapp-css-only';
  }

  let fullscreenAttempted = false;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      fullscreenAttempted = true;
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    }
  } catch {
    // Browser may block fullscreen. CSS portrait shell remains active.
  }

  try {
    const orientation = globalThis.screen.orientation as unknown as {
      lock?: (orientation: 'portrait-primary' | 'portrait') => Promise<void>;
    };
    if (orientation.lock) {
      try {
        await orientation.lock('portrait-primary');
      } catch {
        await orientation.lock('portrait');
      }
      applyPortraitViewportMetrics();
      document.documentElement.dataset.immersiveMode = 'orientation-locked';
      return 'locked';
    }
  } catch {
    // Silent fallback by design. No warning overlay or popup.
  }

  applyPortraitViewportMetrics();
  document.documentElement.dataset.immersiveMode = fullscreenAttempted ? 'fullscreen-only' : 'css-fallback';
  return fullscreenAttempted ? 'fullscreen-only' : 'css-fallback';
}
