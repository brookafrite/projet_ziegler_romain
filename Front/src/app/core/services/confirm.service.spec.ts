import { TestBed } from '@angular/core/testing';

import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  const question = { title: 'Supprimer ?', message: 'Définitif.', confirmLabel: 'Supprimer' };

  beforeEach(() => (service = TestBed.inject(ConfirmService)));

  it('should wait for the answer, then close the question', async () => {
    const answer = service.ask(question);
    expect(service.question()?.title).toBe('Supprimer ?');

    service.answer(true);
    expect(await answer).toBe(true);
    expect(service.question()).toBeNull();
  });

  it('should answer « no » to a question replaced by a new one', async () => {
    const first = service.ask(question);
    service.ask({ ...question, title: 'Autre question' });
    expect(await first).toBe(false);
  });
});
