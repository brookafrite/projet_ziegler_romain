import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const html = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    html.removeAttribute('data-theme');
  });

  it('should follow the computer by default', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.choice()).toBe('auto');
    expect(html.hasAttribute('data-theme')).toBe(false);
  });

  it('should go auto → light → dark → auto, and remember the choice', () => {
    const service = TestBed.inject(ThemeService);

    service.next();
    expect(html.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('carnet-de-terrain-theme')).toBe('light');

    service.next();
    expect(html.getAttribute('data-theme')).toBe('dark');

    service.next();
    expect(service.choice()).toBe('auto');
    expect(html.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('carnet-de-terrain-theme')).toBeNull();
  });

  it('should restore the theme chosen during a previous visit', () => {
    localStorage.setItem('carnet-de-terrain-theme', 'dark');
    expect(TestBed.inject(ThemeService).choice()).toBe('dark');
    expect(html.getAttribute('data-theme')).toBe('dark');
  });
});
