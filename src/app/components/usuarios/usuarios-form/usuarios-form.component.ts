import { Component, inject, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipoUsuario } from '../../../models/enum';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [MdbFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios-form.component.scss',
})
export class UsuariosFormComponent {
  @ViewChild('formulario') formulario!: NgForm;

  usuario: Usuario = new Usuario();
  senha: string = '';
  dropdownOpen: boolean = false;

  get isPagCadastro(): boolean {
    return this.router.url.includes('new');
  }

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

  rotaAtivida = inject(ActivatedRoute);
  roteador = inject(Router);
  usuarioService = inject(UsuarioService);

  constructor(private router: Router) {
    this.usuario.tipoUsuario = TipoUsuario.USUARIO;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.dropdownOpen = false;
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

  save() {
    if (!this.senha || this.senha.length < 5) {
      Swal.fire('A senha precisa ter no mínimo 5 caracteres!', '', 'error');
      return;
    }
    if (!this.usuario.nome || this.usuario.nome.trim() === '') {
      Swal.fire('Nome é obrigatório!', '', 'error');
      return;
    }
    if (!this.usuario.email || this.usuario.email.trim() === '') {
      Swal.fire('Email é obrigatório!', '', 'error');
      return;
    }
    if (!this.usuario.tipoUsuario) {
      Swal.fire('Tipo de usuário é obrigatório!', '', 'error');
      return;
    }

    const usuarioParaEnviar = {
      nome: this.usuario.nome.trim(),
      email: this.usuario.email.trim(),
      senha: this.senha,
      tipoUsuario: this.usuario.tipoUsuario,
      ativo: true
    };

    this.usuarioService.cadastrar(usuarioParaEnviar as any).subscribe({
      next: (mensagem: any) => {
        Swal.fire({
          title: 'Sucesso!',
          text: mensagem?.mensagem || 'Usuário criado com sucesso!',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
        // Reseta o formulário completamente, removendo os erros
        this.formulario.resetForm();
        this.usuario = new Usuario();
        this.usuario.tipoUsuario = TipoUsuario.USUARIO;
        this.senha = '';
      },
      error: (erro) => {
        let mensagemErro = 'Erro ao cadastrar usuário';
        if (erro.error?.erro) mensagemErro = erro.error.erro;
        else if (erro.error?.message) mensagemErro = erro.error.message;
        Swal.fire({ title: 'Erro', text: mensagemErro, icon: 'error' });
      },
    });
  }
}