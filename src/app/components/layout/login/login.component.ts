import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { UsuarioService } from '../../../services/usuario.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/auth.service';
import { Login } from '../../../auth/login';
import { TemaService } from '../../../services/tema.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MdbFormsModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  login: Login = new Login();
  mostrarSenha: boolean = false;
  anoAtual: number = new Date().getFullYear();

  router = inject(Router);
  usuarioService = inject(UsuarioService);
  authService = inject(AuthService);
  temaService = inject(TemaService);

  constructor() {
    this.authService.removerToken();
  }

  isDarkMode(): boolean {
    return this.temaService.isDarkMode();
  }

  alternarTema(): void {
    this.temaService.alternarTema();
  }

  logar() {
    this.authService.logar(this.login).subscribe({
      next: (response) => {
        if (response) {
          this.authService.addToken(response.token);
          this.gerarToast().fire({ icon: 'success', title: 'Seja bem-vindo!' });
          this.router.navigate(['/principal/dashboard']);
        }
      },
      error: (err) => {
        // Lê a mensagem real que vem do backend
        const mensagem = err?.error?.erro || 'Email ou Senha Incorretos!';

        // Se for bloqueio (429), mostra título diferente
        const titulo = err?.status === 429 ? 'Conta Bloqueada' : 'Erro no Login';

        Swal.fire(titulo, mensagem, 'error');
      }
    });
  }

  gerarToast() {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
  }
}