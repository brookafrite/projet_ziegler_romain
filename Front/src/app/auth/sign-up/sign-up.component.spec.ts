import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let fixture: ComponentFixture<SignUpComponent>;
  let component: SignUpComponent;
  let httpMock: HttpTestingController;
  const validForm = { invalid: false } as NgForm;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    component.model = {
      login: 'brook',
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
      nom: 'Ziegler',
      prenom: 'Romain',
      email: 'romain@test.fr',
    };
  });

  afterEach(() => httpMock.verify());

  it('should send the form without confirmPassword and show the created user', () => {
    component.onSubmit(validForm);
    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
    expect(req.request.body).toEqual({
      login: 'brook',
      password: 'Secret123!',
      nom: 'Ziegler',
      prenom: 'Romain',
      email: 'romain@test.fr',
    });
    req.flush({ id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' });

    expect(component.loading()).toBe(false);
    expect(component.createdUser()?.id).toBe(1);
  });

  it('should display an error message when the API fails', () => {
    component.onSubmit(validForm);
    httpMock
      .expectOne(`${environment.apiUrl}/auth/signup`)
      .flush({}, { status: 409, statusText: 'Conflict' });

    expect(component.createdUser()).toBeNull();
    expect(component.errorMessage()).toContain('déjà utilisé');
  });

  it('should not call the API when the form is invalid', () => {
    component.onSubmit({ invalid: true } as NgForm);
    httpMock.expectNone(`${environment.apiUrl}/auth/signup`);
  });
});
