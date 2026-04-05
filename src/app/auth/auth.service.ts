import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TipoUsuario } from '../models/enum';
import { Usuario } from '../models/usuario';
import { jwtDecode } from 'jwt-decode';
import { Login } from './login';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  mensagem: string;
}

export interface DecodedToken {
  role: string;
  id: number;
  sub: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  private API = `${environment.apiUrl}/api/usuarios`;

  logar(login: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, login).pipe(
      tap((response) => {
        // Dados de exibição ficam no localStorage (nome, email)
        const usuario = {
          id: response.id,
          nome: response.nome,
          email: response.email,
          tipoUsuario: response.tipoUsuario,
          ativo: true
        };
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }

  addToken(token: string) {
    // Token fica no sessionStorage — limpa ao fechar o navegador/aba
    sessionStorage.setItem('token', token);
  }

  removerToken() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  jwtDecode(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  isTokenValido(): boolean {
    const decoded = this.jwtDecode();
    if (!decoded) return false;
    const agora = Math.floor(Date.now() / 1000);
    return decoded.exp > agora;
  }

  hasRole(role: string): boolean {
    const decoded = this.jwtDecode();
    if (!decoded) return false;
    if (!this.isTokenValido()) return false;
    return decoded.role === role;
  }

  getUsuarioLogado(): Usuario | null {
    if (!this.isTokenValido()) {
      this.removerToken();
      return null;
    }
    const usuarioStr = sessionStorage.getItem('usuario');
    if (usuarioStr) {
      return JSON.parse(usuarioStr) as Usuario;
    }
    return null;
  }
}