import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { TipoUsuario } from '../models/enum';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor() {}

  private criarHeaders(): HttpHeaders {
    const usuario = this.authService.getUsuarioLogado();
    
    console.log('📋 Criando headers para requisição');
    console.log('👤 Usuário logado:', usuario);
    
    if (!usuario) {
      console.error('❌ Nenhum usuário logado encontrado!');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Usuario-Id': usuario.id?.toString() || '',
      'X-Usuario-Tipo': usuario.tipoUsuario || ''
    });

    console.log('✅ Headers criados:', {
      'X-Usuario-Id': usuario.id?.toString() || '',
      'X-Usuario-Tipo': usuario.tipoUsuario || ''
    });

    return headers;
  }

  cadastrar(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastrar`, usuario);
  }

  listarTodos(): Observable<Usuario[]> {
    console.log('🔄 Chamando API para listar todos os usuários');
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.criarHeaders() });
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.criarHeaders() });
  }

  atualizar(id: number, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, { headers: this.criarHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.criarHeaders() });
  }

  desativar(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desativar`, {}, { headers: this.criarHeaders() });
  }

  reativar(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reativar`, {}, { headers: this.criarHeaders() });
  }
}