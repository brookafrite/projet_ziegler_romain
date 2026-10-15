import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('should render the sign-up form', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sign-up form')).toBeTruthy();
  });
});
