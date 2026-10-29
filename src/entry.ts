// Keep the v3 fishing experiment lightweight and separate from the legacy UI.
// The standard URL still loads the existing game unchanged.
if (new URLSearchParams(window.location.search).get('preview') === 'v3') {
  void import('./v3/preview').then(({ bootV3Preview }) => bootV3Preview());
} else {
  // Preserve legacy opening preload only for the legacy game, not the tiny v3 demo.
  const opening = document.createElement('link');
  opening.rel = 'preload';
  opening.as = 'video';
  opening.type = 'video/mp4';
  opening.href = './assets/v2120/opening/aqua_opening_v2120.mp4';
  document.head.appendChild(opening);
  void import('./main');
}
