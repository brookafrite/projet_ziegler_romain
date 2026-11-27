import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideStore, Store } from '@ngxs/store';
import { App } from './app';
import { routes } from './app.routes';
import { Login } from './core/states/auth/auth.actions';
import { AuthState } from './core/states/auth/auth.state';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      // Store NGXS sans persistance : personne n'est connecté au départ
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting(), provideStore([AuthState])],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the site header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('Carnet de terrain');
  });

  function navLinks(fixture: { nativeElement: HTMLElement }): (string | null)[] {
    return [...fixture.nativeElement.querySelectorAll('.nav a')].map((a) => a.getAttribute('href'));
  }

  it('should link to the public pages, without the admin page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(navLinks(fixture)).toEqual(['/pollutions', '/pollutions/nouvelle', '/foret', '/connexion', '/inscription']);
  });

  it('should show the users page link to an admin only', async () => {
    TestBed.inject(Store).dispatch(
      new Login({ id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'admin' }),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(navLinks(fixture)).toEqual(['/pollutions', '/pollutions/nouvelle', '/foret', '/utilisateurs']);
  });

  it('should greet the logged-in user instead of the login links', async () => {
    TestBed.inject(Store).dispatch(
      new Login({ id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' }),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('.nav')!;
    expect(nav.textContent).toContain('Bonjour Romain');
    expect(nav.querySelector('a[href="/connexion"]')).toBeNull();
  });
});
