import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ConfirmService } from '../services/confirm.service';
import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  function leave(page: HasUnsavedChanges) {
    const snapshot = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => unsavedChangesGuard(page, snapshot, state, state));
  }

  /** Simule la réponse de l'utilisateur dans la fenêtre de confirmation. */
  function answerWith(confirmed: boolean) {
    return vi.spyOn(TestBed.inject(ConfirmService), 'ask').mockResolvedValue(confirmed);
  }

  it('should let the user leave when nothing was typed', () => {
    const ask = answerWith(false);
    expect(leave({ hasUnsavedChanges: () => false })).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });

  it('should ask before leaving a form that was not saved', async () => {
    answerWith(false);
    expect(await leave({ hasUnsavedChanges: () => true })).toBe(false);
  });

  it('should leave if the user confirms', async () => {
    answerWith(true);
    expect(await leave({ hasUnsavedChanges: () => true })).toBe(true);
  });
});
