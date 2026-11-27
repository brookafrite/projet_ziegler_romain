import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ListReturnService } from './list-return.service';

@Component({ template: '' })
class EmptyPage {}

describe('ListReturnService', () => {
  let service: ListReturnService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'pollutions', component: EmptyPage },
          { path: 'pollutions/:id', component: EmptyPage },
          { path: '', component: EmptyPage },
        ]),
      ],
    });
    service = TestBed.inject(ListReturnService);
    router = TestBed.inject(Router);
  });

  it('should remember the last view of the list, with its criteria', async () => {
    expect(service.listUrl).toBe('/pollutions');
    await router.navigateByUrl('/pollutions?niveau=elevee&tri=dangereuses');
    await router.navigateByUrl('/pollutions/7');
    expect(service.listUrl).toBe('/pollutions?niveau=elevee&tri=dangereuses');
  });

  it('should go back in the history when the list was the previous page', async () => {
    const back = vi.spyOn(TestBed.inject(Location), 'back');
    await router.navigateByUrl('/pollutions?type=Eau');
    await router.navigateByUrl('/pollutions/7');

    service.backToList();
    expect(back).toHaveBeenCalled();
  });

  it('should open the remembered list when coming from elsewhere', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl');
    await router.navigateByUrl('/pollutions?type=Eau');
    await router.navigateByUrl('/');
    await router.navigateByUrl('/pollutions/7');

    service.backToList();
    expect(navigate).toHaveBeenLastCalledWith('/pollutions?type=Eau');
  });
});
