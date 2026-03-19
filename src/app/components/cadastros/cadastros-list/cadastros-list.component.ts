import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import Swal from 'sweetalert2';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { CadastrosFormComponent } from '../cadastros-form/cadastros-form.component';
import { TipoUsuario } from '../../../models/enum';

@Component({
  selector: 'app-cadastros-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MdbModalModule],
  templateUrl: './cadastros-list.component.html',
  styleUrl: './cadastros-list.component.scss',
})
export class CadastrosListComponent implements OnInit {
  lista: Usuario[] = [];
  listaFiltrada: Usuario[] = [];
  pesquisa: string = '';

  usuarioService = inject(UsuarioService);
  modalService = inject(MdbModalService);
  modalRef!: MdbModalRef<CadastrosFormComponent>;

  tipoUsuarioLabels: { [key: string]: string } = {
    'DEMANDANTE': 'Demandante',
    'USUARIO': 'Usuário'
  };

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuarioService.listarTodos().subscribe({
      next: (usuarios) => {
        this.lista = usuarios;
        this.listaFiltrada = usuarios;
      },
      error: (erro) => {
        console.error('Erro ao carregar usuários:', erro);
        Swal.fire('Erro', 'Não foi possível carregar os usuários', 'error');
      }
    });
  }

  filtrar() {
    if (!this.pesquisa || this.pesquisa.trim() === '') {
      this.listaFiltrada = this.lista;
      return;
    }

    const termo = this.pesquisa.toLowerCase().trim();
    this.listaFiltrada = this.lista.filter(usuario =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      this.tipoUsuarioLabels[usuario.tipoUsuario].toLowerCase().includes(termo)
    );
  }

  editar(usuario: Usuario) {
    this.modalRef = this.modalService.open(CadastrosFormComponent, {
      modalClass: 'modal-dialog-centered modal-edit-usuario',
      data: { usuario: { ...usuario } }
    });

    this.modalRef.onClose.subscribe(() => {
      this.carregarUsuarios();
    });
  }

  excluir(usuario: Usuario) {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja realmente excluir o usuário "${usuario.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.excluir(usuario.id!).subscribe({
          next: () => {
            Swal.fire('Excluído!', 'Usuário excluído com sucesso.', 'success');
            this.carregarUsuarios();
          },
          error: (erro) => {
            console.error('Erro ao excluir:', erro);
            const mensagem = erro.error?.erro || 'Erro ao excluir usuário';
            Swal.fire('Erro', mensagem, 'error');
          }
        });
      }
    });
  }

  toggleAtivo(usuario: Usuario) {
    const acao = usuario.ativo ? 'desativar' : 'reativar';
    const service = usuario.ativo
      ? this.usuarioService.desativar(usuario.id!)
      : this.usuarioService.reativar(usuario.id!);

    Swal.fire({
      title: `${acao.charAt(0).toUpperCase() + acao.slice(1)} usuário?`,
      text: `Deseja ${acao} o usuário "${usuario.nome}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        service.subscribe({
          next: () => {
            Swal.fire('Sucesso!', `Usuário ${acao === 'desativar' ? 'desativado' : 'reativado'} com sucesso.`, 'success');
            this.carregarUsuarios();
          },
          error: (erro) => {
            console.error(`Erro ao ${acao}:`, erro);
            const mensagem = erro.error?.erro || `Erro ao ${acao} usuário`;
            Swal.fire('Erro', mensagem, 'error');
          }
        });
      }
    });
  }

  getStatusLabel(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }

  getStatusClass(ativo: boolean): string {
    return ativo ? 'badge bg-success' : 'badge bg-danger';
  }
}