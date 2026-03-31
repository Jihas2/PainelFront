import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se está logado e se o token não expirou
  if (!authService.isTokenValido()) {
    authService.removerToken();
    Swal.fire({
      title: 'Sessão Expirada',
      text: 'Faça login novamente para continuar',
      icon: 'warning',
      confirmButtonText: 'Ok'
    });
    router.navigate(['/login']);
    return false;
  }

  // Bloqueia USUARIO de acessar cadastro de usuários
  if (authService.hasRole('USUARIO') && state.url === '/principal/usuarios/new') {
    Swal.fire({
      title: 'Permissão Negada',
      text: 'Você não tem permissão para acessar este conteúdo',
      icon: 'error'
    });
    router.navigate(['/principal/dashboard']);
    return false;
  }

  return true;
};