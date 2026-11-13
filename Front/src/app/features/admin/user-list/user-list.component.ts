import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
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

  remove(user: User): void {
    if (!confirm(`Supprimer le compte de ${user.prenom} ${user.nom} ? Cette action est définitive.`)) return;

    this.deletingId.set(user.id);
    this.errorMessage.set(null);

    this.userService.delete(user.id).subscribe({
      next: () => {
        if (this.isCurrentUser(user)) this.authService.logout(); // son propre compte : on se déconnecte
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set(`Le compte de ${user.prenom} ${user.nom} n’a pas pu être supprimé.`);
        this.deletingId.set(null);
      },
    });
  }
}
