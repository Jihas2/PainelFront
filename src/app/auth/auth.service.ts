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
        const usuario = {
          id: response.id,
          nome: response.nome,
          email: response.email,
          tipoUsuario: response.tipoUsuario,
          ativo: true
        };
        localStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }

  addToken(token: string) {
    localStorage.setItem('token', token);
  }

  removerToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // Decodifica o token JWT e retorna os dados
  jwtDecode(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  // Verifica se o token ainda é válido (não expirado)
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
      // Token expirado — limpa tudo e força novo login
      this.removerToken();
      return null;
    }
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      return JSON.parse(usuarioStr) as Usuario;
    }
    return null;
  }
}