import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

/** Une notification affichée en bas de l'écran. */
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * Petites notifications (« Pollution enregistrée ✓ ») qui disparaissent toutes seules.
 * Un seul service pour toute l'application : n'importe quelle page peut en afficher une,
 * le composant ToastContainer (dans app.html) les affiche.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly list = signal<Toast[]>([]);

  /** Notifications visibles, de la plus ancienne à la plus récente. */
  readonly toasts = this.list.asReadonly();

  success(message: string): void {
    this.show('success', message, 4000);
  }

  /** Une erreur reste un peu plus longtemps : on a le temps de la lire. */
  error(message: string): void {
    this.show('error', message, 7000);
  }

  dismiss(id: number): void {
    this.list.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(kind: ToastKind, message: string, duration: number): void {
    const id = this.nextId++;
    // Nouvelle liste (jamais de push) : le signal prévient les composants OnPush
    this.list.update((toasts) => [...toasts, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
