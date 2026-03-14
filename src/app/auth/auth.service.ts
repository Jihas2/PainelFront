import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TipoUsuario } from '../models/enum';
import { Usuario } from '../models/usuario';
import { jwtDecode, JwtPayload } from 'jwt-decode';
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
        console.log('Usuário armazenado:', usuario);
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

  jwtDecode(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    return jwtDecode<DecodedToken>(token);
  }

  hasRole(role: string) {
    const user = this.getUsuarioLogado();
    if (user) {
      console.log('Verificando role:', user.tipoUsuario, '===', role);
      return user.tipoUsuario === role;
    }
    return false;
  }

  getUsuarioLogado(): Usuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      return JSON.parse(usuarioStr) as Usuario;
    }
    return null;
  }
}