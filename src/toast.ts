import type { Screen, ToastOptions } from './types';

export class ToastManager {
  private root: HTMLElement;
  private navigate: (screen: Screen) => void;

  constructor(root: HTMLElement, navigate: (screen: Screen) => void) {
    this.root = root;
    this.navigate = navigate;
  }

  show(options: ToastOptions): void {
    const item = document.createElement('button');
    item.className = `toast toast-${options.type ?? 'normal'}`;
    item.type = 'button';
    item.innerHTML = `<strong>${options.title}</strong>${options.message ? `<span>${options.message}</span>` : ''}`;
    this.root.appendChild(item);

    let startX = 0;
    let currentX = 0;
    let dragging = false;
    const close = () => {
      item.classList.add('toast-out');
      window.setTimeout(() => item.remove(), 180);
    };

    item.addEventListener('pointerdown', (ev) => {
      dragging = true;
      startX = ev.clientX;
      currentX = ev.clientX;
      item.setPointerCapture(ev.pointerId);
    });

    item.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      currentX = ev.clientX;
      const dx = currentX - startX;
      item.style.transform = `translateX(${dx}px)`;
      item.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / 190));
    });

    item.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      const dx = currentX - startX;
      if (Math.abs(dx) > 84) {
        close();
        return;
      }
      item.style.transform = '';
      item.style.opacity = '';
    });

    item.addEventListener('click', () => {
      if (options.actionScreen) this.navigate(options.actionScreen);
      else if (options.type === 'mission' || options.type === 'reward') this.navigate('mission');
      else if (options.type === 'shop') this.navigate('shop');
      else if (options.type === 'dex') this.navigate('dex');
      else if (options.type === 'fishing') this.navigate('fishing');
      close();
    });

    window.setTimeout(close, 2000);
  }
}
