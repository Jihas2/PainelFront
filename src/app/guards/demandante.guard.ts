import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DemandanteGuard implements CanActivate {

  authService = inject(AuthService);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // Verifica se está logado e se o token não expirou
    if (!this.authService.isTokenValido()) {
      this.authService.removerToken();
      Swal.fire({
        title: 'Sessão Expirada',
        text: 'Faça login novamente para continuar',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
      this.router.navigate(['/login']);
      return false;
    }

    // Role lida do JWT
    if (this.authService.hasRole('DEMANDANTE')) {
      return true;
    }

    Swal.fire({
      title: 'Acesso Negado',
      text: 'Esta página é restrita para demandantes',
      icon: 'error'
    });
    this.router.navigate(['/principal/dashboard']);
    return false;
  }
}