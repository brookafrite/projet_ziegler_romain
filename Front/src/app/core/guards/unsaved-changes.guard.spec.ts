import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  function leave(page: HasUnsavedChanges) {
    const snapshot = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return unsavedChangesGuard(page, snapshot, state, state);
  }

  afterEach(() => vi.restoreAllMocks());

  it('should let the user leave when nothing was typed', () => {
    const ask = vi.spyOn(window, 'confirm');
    expect(leave({ hasUnsavedChanges: () => false })).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });

  it('should ask before leaving a form that was not saved', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    expect(leave({ hasUnsavedChanges: () => true })).toBe(false);
  });

  it('should leave if the user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(leave({ hasUnsavedChanges: () => true })).toBe(true);
  });
});
