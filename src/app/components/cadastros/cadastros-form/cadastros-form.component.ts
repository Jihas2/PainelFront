import { Component, inject, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import Swal from 'sweetalert2';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { TipoUsuario } from '../../../models/enum';

@Component({
  selector: 'app-cadastros-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MdbFormsModule],
  templateUrl: './cadastros-form.component.html',
  styleUrl: './cadastros-form.component.scss',
})
export class CadastrosFormComponent implements OnInit {
  @Input() usuario!: Usuario;

  novaSenha: string = '';
  alterarSenha: boolean = false;
  dropdownOpen: boolean = false;

  usuarioService = inject(UsuarioService);

  tipoUsuarioList = [
    {
      value: TipoUsuario.DEMANDANTE,
      label: 'Demandante',
      desc: 'Acesso completo ao sistema',
      icon: 'fas fa-user-shield'
    },
    {
      value: TipoUsuario.USUARIO,
      label: 'Usuário',
      desc: 'Acesso padrão ao sistema',
      icon: 'fas fa-user'
    },
  ];

  constructor(public modalRef: MdbModalRef<CadastrosFormComponent>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit() {
    if (!this.usuario) {
      this.usuario = new Usuario();
      this.usuario.tipoUsuario = TipoUsuario.USUARIO;
      this.usuario.ativo = true;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectTipo(tipo: any) {
    this.usuario.tipoUsuario = tipo.value;
    this.dropdownOpen = false;
  }

  getSelectedLabel(): string {
    const found = this.tipoUsuarioList.find(t => t.value === this.usuario.tipoUsuario);
    return found ? found.label : 'Selecione um tipo';
  }

  getSelectedIcon(): string {
    const found = this.tipoUsuarioList.find(t => t.value === this.usuario.tipoUsuario);
    return found ? found.icon : 'fas fa-user';
  }

  salvar() {
    if (!this.usuario.nome || this.usuario.nome.trim() === '') {
      Swal.fire('Atenção', 'Nome é obrigatório', 'warning');
      return;
    }
    if (!this.usuario.email || this.usuario.email.trim() === '') {
      Swal.fire('Atenção', 'Email é obrigatório', 'warning');
      return;
    }
    if (!this.usuario.tipoUsuario) {
      Swal.fire('Atenção', 'Tipo de usuário é obrigatório', 'warning');
      return;
    }
    if (this.alterarSenha) {
      if (!this.novaSenha || this.novaSenha.length < 5) {
        Swal.fire('Atenção', 'A nova senha deve ter no mínimo 5 caracteres', 'warning');
        return;
      }
      this.usuario.senha = this.novaSenha;
    }

    const usuarioParaEnviar: any = {
      nome: this.usuario.nome.trim(),
      email: this.usuario.email.trim(),
      tipoUsuario: this.usuario.tipoUsuario,
      ativo: this.usuario.ativo
    };

    if (this.alterarSenha && this.novaSenha) {
      usuarioParaEnviar.senha = this.novaSenha;
    }

    this.usuarioService.atualizar(this.usuario.id!, usuarioParaEnviar).subscribe({
      next: () => {
        Swal.fire('Sucesso!', 'Usuário atualizado com sucesso', 'success');
        this.fechar();
      },
      error: (erro) => {
        console.error('Erro ao atualizar:', erro);
        const mensagem = erro.error?.erro || 'Erro ao atualizar usuário';
        Swal.fire('Erro', mensagem, 'error');
      }
    });
  }

  fechar() {
    this.modalRef.close();
  }
}