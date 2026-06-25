import type { Screen, ToastOptions } from './types';

export class ToastManager {
  private readonly root: HTMLElement;
  private readonly navigate: (screen: Screen) => void;
  private hideTimer: number | null = null;

  constructor(root: HTMLElement, navigate: (screen: Screen) => void) {
    this.root = root;
    this.navigate = navigate;
    this.root.replaceChildren();
    this.root.setAttribute('aria-hidden', 'true');
    this.root.dataset.v2163CenterToast = 'enabled-center-aqua-card-feedback';
  }

  show(options: ToastOptions): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.root.replaceChildren();
    this.root.removeAttribute('aria-hidden');
    this.root.dataset.toastType = options.type ?? 'normal';
    const card = document.createElement('section');
    card.className = `toast toast-item v2163-center-toast toast-${options.type ?? 'normal'}`;
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'assertive');
    const title = document.createElement('strong');
    title.textContent = options.title;
    card.appendChild(title);
    if (options.message) {
      const message = document.createElement('span');
      message.textContent = options.message;
      card.appendChild(message);
    }
    if (options.actionScreen) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = options.actionScreen === 'shop' ? '상점으로' : options.actionScreen === 'gear' ? '장비로' : options.actionScreen === 'fishing' ? '낚시터로' : options.actionScreen === 'inventory' ? '가방 보기' : '확인';
      button.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.dismiss();
        this.navigate(options.actionScreen!);
      });
      card.appendChild(button);
    }
    card.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    this.root.appendChild(card);
    this.hideTimer = window.setTimeout(() => this.dismiss(), options.actionScreen ? 3600 : 2800);
  }

  private dismiss(): void {
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.root.replaceChildren();
    this.root.setAttribute('aria-hidden', 'true');
  }
}
