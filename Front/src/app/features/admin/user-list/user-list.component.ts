import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('La liste des utilisateurs n’a pas pu être chargée.');
        this.loading.set(false);
      },
    });
  }

  isCurrentUser(user: User): boolean {
    return this.authService.currentUser()?.id === user.id;
  }

  async remove(user: User): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer ce compte ?',
      message: `Le compte de ${user.prenom} ${user.nom} sera supprimé définitivement.`,
      confirmLabel: 'Supprimer le compte',
      danger: true,
    });
    if (!confirmed) return;

    this.deletingId.set(user.id);

    this.userService.delete(user.id).subscribe({
      next: () => {
        if (this.isCurrentUser(user)) this.authService.logout(); // son propre compte : on se déconnecte
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.deletingId.set(null);
        this.toastService.success(`Le compte de ${user.prenom} ${user.nom} a été supprimé.`);
      },
      error: () => {
        this.toastService.error(`Le compte de ${user.prenom} ${user.nom} n’a pas pu être supprimé.`);
        this.deletingId.set(null);
      },
    });
  }
}
