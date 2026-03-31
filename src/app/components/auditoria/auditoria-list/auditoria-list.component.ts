import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

export interface AuditoriaLog {
  id: number;
  usuarioExecutorId: number | null;
  usuarioExecutorNome: string | null;
  usuarioAlvoId: number | null;
  usuarioAlvoNome: string | null;
  acao: string;
  detalhes: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  dataHora: string;
}

@Component({
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria-list.component.html',
  styleUrl: './auditoria-list.component.scss',
})
export class AuditoriaListComponent implements OnInit {

  lista: AuditoriaLog[] = [];
  listaFiltrada: AuditoriaLog[] = [];
  dropdownAcaoOpen = false;

  filtro = {
    pesquisa: '',
    acao: ''
  };

  private API = `${environment.apiUrl}/api/auditoria`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.carregarLogs();
  }

  carregarLogs(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<AuditoriaLog[]>(this.API, { headers }).subscribe({
      next: (logs) => {
        this.lista = logs;
        this.aplicarFiltro();
      },
      error: () => {
        Swal.fire('Erro', 'Não foi possível carregar os logs de auditoria', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    this.listaFiltrada = this.lista.filter(log => {
      const pesquisa = this.filtro.pesquisa.toLowerCase();

      const passaPesquisa = !pesquisa || (
        (log.usuarioExecutorNome?.toLowerCase().includes(pesquisa)) ||
        (log.usuarioAlvoNome?.toLowerCase().includes(pesquisa)) ||
        (log.detalhes?.toLowerCase().includes(pesquisa)) ||
        (log.acao?.toLowerCase().includes(pesquisa))
      );

      const passaAcao = !this.filtro.acao || log.acao === this.filtro.acao;

      return passaPesquisa && passaAcao;
    });
  }

  selecionarAcao(acao: string): void {
    this.filtro.acao = acao;
    this.dropdownAcaoOpen = false;
    this.aplicarFiltro();
  }

  limparFiltros(): void {
    this.filtro = { pesquisa: '', acao: '' };
    this.aplicarFiltro();
  }

  contarAcao(acao: string): number {
    return this.lista.filter(l => l.acao === acao).length;
  }

  getAcaoLabel(): string {
    const labels: { [key: string]: string } = {
      '': 'Todas as ações',
      'LOGIN_SUCESSO': 'Login Sucesso',
      'LOGIN_FALHA': 'Login Falha',
      'LOGIN_BLOQUEADO': 'Login Bloqueado',
      'CADASTRO': 'Cadastro',
      'ALTERACAO_SENHA': 'Alteração de Senha',
      'ALTERACAO_EMAIL': 'Alteração de Email',
      'ALTERACAO_NOME': 'Alteração de Nome',
      'ALTERACAO_TIPO': 'Alteração de Tipo',
      'DESATIVACAO': 'Desativação',
      'REATIVACAO': 'Reativação',
      'EXCLUSAO': 'Exclusão',
    };
    return labels[this.filtro.acao] || this.filtro.acao;
  }

  formatarAcao(acao: string): string {
    const labels: { [key: string]: string } = {
      'LOGIN_SUCESSO': 'Login',
      'LOGIN_FALHA': 'Falha Login',
      'LOGIN_BLOQUEADO': 'Bloqueado',
      'CADASTRO': 'Cadastro',
      'ALTERACAO_SENHA': 'Senha',
      'ALTERACAO_EMAIL': 'Email',
      'ALTERACAO_NOME': 'Nome',
      'ALTERACAO_TIPO': 'Tipo',
      'ATUALIZACAO': 'Atualização',
      'DESATIVACAO': 'Desativação',
      'REATIVACAO': 'Reativação',
      'EXCLUSAO': 'Exclusão',
    };
    return labels[acao] || acao;
  }

  getAcaoClass(acao: string): string {
    const classes: { [key: string]: string } = {
      'LOGIN_SUCESSO': 'sucesso',
      'LOGIN_FALHA': 'falha',
      'LOGIN_BLOQUEADO': 'bloqueado',
      'CADASTRO': 'cadastro',
      'ALTERACAO_SENHA': 'alteracao',
      'ALTERACAO_EMAIL': 'alteracao',
      'ALTERACAO_NOME': 'alteracao',
      'ALTERACAO_TIPO': 'alteracao',
      'ATUALIZACAO': 'alteracao',
      'DESATIVACAO': 'desativacao',
      'REATIVACAO': 'reativacao',
      'EXCLUSAO': 'exclusao',
    };
    return classes[acao] || 'default';
  }

  getAcaoIcon(acao: string): string {
    const icons: { [key: string]: string } = {
      'LOGIN_SUCESSO': 'fa-sign-in-alt',
      'LOGIN_FALHA': 'fa-times-circle',
      'LOGIN_BLOQUEADO': 'fa-ban',
      'CADASTRO': 'fa-user-plus',
      'ALTERACAO_SENHA': 'fa-key',
      'ALTERACAO_EMAIL': 'fa-envelope',
      'ALTERACAO_NOME': 'fa-user-edit',
      'ALTERACAO_TIPO': 'fa-user-tag',
      'ATUALIZACAO': 'fa-edit',
      'DESATIVACAO': 'fa-user-slash',
      'REATIVACAO': 'fa-user-check',
      'EXCLUSAO': 'fa-trash',
    };
    return icons[acao] || 'fa-circle';
  }
}