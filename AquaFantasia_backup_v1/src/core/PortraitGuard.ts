export type PortraitViewportMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  offsetTop: number;
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
  const offsetTop = Math.max(0, Math.floor(window.visualViewport?.offsetTop ?? 0));
  const physicalLandscape = viewportWidth > viewportHeight;
  const kakaoInApp = isKakaoInAppBrowser();
  const hostileInApp = isHostileInAppBrowser();

  // Aqua Fantasia is a portrait-only mobile game. If an in-app browser rotates
  // the physical viewport, keep a portrait-sized game surface centered instead
  // of changing to a landscape layout.
  const maxPortraitWidth = hostileInApp ? 430 : 500;
  const minUsableWidth = Math.min(340, viewportWidth);
  const appWidth = physicalLandscape
    ? clamp(Math.floor(viewportHeight * 0.78), Math.min(280, viewportWidth), Math.min(maxPortraitWidth, viewportWidth))
    : Math.min(viewportWidth, maxPortraitWidth);
  const appHeight = viewportHeight;

  return {
    viewportWidth,
    viewportHeight,
    offsetTop,
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
  root.style.setProperty('--viewport-offset-top', `${metrics.offsetTop}px`);
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

async function requestBrowserFullscreenWhenSafe(metrics: PortraitViewportMetrics): Promise<'fullscreen' | 'blocked' | 'skipped'> {
  const root = document.documentElement;

  // Kakao/hostile in-app browsers are deliberately excluded. In those shells,
  // browser fullscreen frequently shows a system message and can rotate the
  // viewport. They stay in CSS immersive portrait mode.
  if (metrics.hostileInApp || metrics.physicalLandscape) return 'skipped';
  if (document.fullscreenElement) return 'fullscreen';
  if (!document.fullscreenEnabled || !root.requestFullscreen) return 'skipped';

  try {
    await root.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
    return 'fullscreen';
  } catch {
    return 'blocked';
  }
}

export async function requestHardPortraitLock(): Promise<'browser-fullscreen' | 'css-portrait' | 'inapp-css-only'> {
  const metrics = applyPortraitViewportMetrics();
  const root = document.documentElement;

  // Never call the Screen Orientation lock API. Portrait is enforced by the
  // manifest, viewport metrics and CSS cage so Kakao/Android rotation bugs do
  // not reappear.
  root.dataset.orientationApi = 'disabled';

  const fullscreenResult = await requestBrowserFullscreenWhenSafe(metrics);
  root.dataset.fullscreenApi = metrics.hostileInApp ? 'disabled-inapp' : fullscreenResult;
  root.dataset.immersiveMode = metrics.hostileInApp
    ? 'inapp-css-only'
    : fullscreenResult === 'fullscreen'
      ? 'browser-fullscreen'
      : 'css-immersive';

  applyPortraitViewportMetrics();
  return metrics.hostileInApp ? 'inapp-css-only' : fullscreenResult === 'fullscreen' ? 'browser-fullscreen' : 'css-portrait';
}
