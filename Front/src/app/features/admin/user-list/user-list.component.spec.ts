import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/users`;
  const users = [
    { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' },
    { id: 2, login: 'alice', nom: 'Dupont', prenom: 'Alice', email: 'alice@test.fr' },
  ];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // lance ngOnInit, donc le GET
    httpMock.expectOne(url).flush(users);
  });

  afterEach(() => httpMock.verify());

  it('should load the users from the API', () => {
    expect(component.loading()).toBe(false);
    expect(component.users().map((u) => u.login)).toEqual(['brook', 'alice']);
  });

  it('should remove a user from the list once the API confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.remove(users[1]);
    const req = httpMock.expectOne(`${url}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(component.users().map((u) => u.id)).toEqual([1]);
  });
});
