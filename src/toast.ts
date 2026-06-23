import type { Screen, ToastOptions } from './types';

export class ToastManager {
  private readonly root: HTMLElement;
  private readonly navigate: (screen: Screen) => void;

  constructor(root: HTMLElement, navigate: (screen: Screen) => void) {
    this.root = root;
    this.navigate = navigate;
    this.root.replaceChildren();
    this.root.setAttribute('aria-hidden', 'true');
    this.root.dataset.v214ToastDisabled = 'true';
  }

  show(_options: ToastOptions): void {
    // v2.1.4: toast popups are intentionally disabled.
    // Contextual feedback now stays inside the active aqua-card screen, fishing badge,
    // mission/result card, or village guide so no floating toast UI appears.
    void this.navigate;
    this.root.replaceChildren();
  }
}
