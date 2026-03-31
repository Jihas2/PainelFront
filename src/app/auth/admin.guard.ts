import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import Swal from 'sweetalert2';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

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

  if (authService.hasRole('DEMANDANTE')) {
    return true;
  }

  Swal.fire({
    icon: 'error',
    title: 'Acesso Negado',
    text: 'Apenas usuários DEMANDANTE podem acessar esta página',
  });
  router.navigate(['/principal/dashboard']);
  return false;
};