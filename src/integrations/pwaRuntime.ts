export async function registerPwa() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}
