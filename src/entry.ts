// AquaFantasia V3 is the sole production entry. Legacy V2 no longer boots.
void import('./v3/preview')
  .then(({ bootAquaFantasia }) => bootAquaFantasia())
  .catch((error: unknown) => {
    console.error('AquaFantasia failed to load', error);
    const root = document.getElementById('app');
    if (root) {
      root.textContent = '게임을 불러오지 못했어요. 연결 상태를 확인하고 새로고침해 주세요.';
      root.setAttribute('role', 'alert');
    }
  });

// Register the new PWA worker at the current GitHub Pages directory, not at the origin root.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    const workerUrl = new URL('./sw.js', window.location.href);
    void navigator.serviceWorker.register(workerUrl.href)
      .catch((error: unknown) => console.warn('Offline support unavailable', error));
  }, { once: true });
}
