import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const meuhttpInterceptor: HttpInterceptorFn = (request, next) => {
  let router = inject(Router);

  let token = localStorage.getItem('token');
  
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: 'Bearer ' + token },
    });
  }

  return next(request).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Erro: 401',
            text: "Usuário não autenticado, entre novamente",
          }).then(() => router.navigate(['/login']));
        } else if (err.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Erro: 403',
            text: "Você não possui permissão para acessar esta função",
          });
        } else {
          console.error('HTTP error:', err);
        }

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Acesso negado',
          text: err.message,
        }).then(() => router.navigate(['/login']));
      }

      return throwError(() => err);
    })
  );
};