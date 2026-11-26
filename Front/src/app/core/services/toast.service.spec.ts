import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('should show a notification, then hide it after a few seconds', () => {
    service.success('Pollution enregistrée.');
    expect(service.toasts().map((t) => t.message)).toEqual(['Pollution enregistrée.']);

    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toEqual([]);
  });

  it('should keep an error longer than a success', () => {
    service.error('Échec de la suppression.');
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(3000);
    expect(service.toasts()).toEqual([]);
  });

  it('should close a notification on demand', () => {
    service.success('Un');
    service.success('Deux');
    service.dismiss(service.toasts()[0].id);
    expect(service.toasts().map((t) => t.message)).toEqual(['Deux']);
  });
});
