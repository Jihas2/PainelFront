import { Component, inject } from '@angular/core';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TemaService } from '../../../services/tema.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MdbCollapseModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  temaService = inject(TemaService);

  dropdownAberto = false;

  isActive(rota: string): boolean {
    return this.router.url.includes(rota);
  }

  isDarkMode(): boolean {
    return this.temaService.isDarkMode();
  }

  alternarTema(): void {
    this.temaService.alternarTema();
  }

  isDemandante(): boolean {
    return this.authService.hasRole('DEMANDANTE');
  }

  getUsuario() {
    return this.authService.getUsuarioLogado();
  }

  getNomeUsuario(): string {
    const usuario = this.getUsuario();
    return usuario?.nome || 'Usuário';
  }

  getEmailUsuario(): string {
    const usuario = this.getUsuario();
    return usuario?.email || '';
  }

  getTipoUsuario(): string {
    const usuario = this.getUsuario();
    return usuario?.tipoUsuario === 'DEMANDANTE' ? 'Demandante' : 'Usuário';
  }

  getIniciais(): string {
    const usuario = this.getUsuario();
    if (!usuario || !usuario.nome) return 'U';
    const nomes = usuario.nome.trim().split(' ');
    if (nomes.length === 1) return nomes[0].charAt(0).toUpperCase();
    return (nomes[0].charAt(0) + nomes[nomes.length - 1].charAt(0)).toUpperCase();
  }

  toggleDropdown() {
    this.dropdownAberto = !this.dropdownAberto;
  }

  fecharDropdown() {
    this.dropdownAberto = false;
  }

  sair() {
    this.authService.removerToken();
    this.router.navigate(['/login']);
  }
}