import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly TEMA_KEY = 'tema';

  constructor() {
    this.aplicarTema();
  }

  getTema(): string {
    return localStorage.getItem(this.TEMA_KEY) || 'claro';
  }

  isDarkMode(): boolean {
    return this.getTema() === 'escuro';
  }

  alternarTema(): void {
    const novoTema = this.isDarkMode() ? 'claro' : 'escuro';
    localStorage.setItem(this.TEMA_KEY, novoTema);
    this.aplicarTema();
  }

  aplicarTema(): void {
    const tema = this.getTema();
    if (tema === 'escuro') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}