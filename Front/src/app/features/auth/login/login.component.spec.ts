import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  const validForm = { invalid: false } as NgForm;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    component.model = { login: 'brook', password: 'Secret123!' };
  });

  afterEach(() => httpMock.verify());

  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' as const };

  function logIn() {
    component.onSubmit(validForm);
    httpMock.expectOne(`${environment.apiUrl}/users/login`).flush(user);
  }

  it('should go to the pollution list after logging in', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    logIn();
    expect(navigate).toHaveBeenCalledWith('/pollutions');
  });

  it('should go back to the page asked before logging in (?retour=…)', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentRef.setInput('retour', '/pollutions/nouvelle');
    logIn();
    expect(navigate).toHaveBeenCalledWith('/pollutions/nouvelle');
  });

  it('should ignore a return address outside the site', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentRef.setInput('retour', '//pirate.example');
    logIn();
    expect(navigate).toHaveBeenCalledWith('/pollutions');
  });

  it('should show a message when the credentials are wrong', () => {
    component.onSubmit(validForm);
    httpMock.expectOne(`${environment.apiUrl}/users/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage()).toBe('Login ou mot de passe incorrect.');
    expect(component.loading()).toBe(false);
  });
});
