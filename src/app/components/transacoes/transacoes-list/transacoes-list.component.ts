import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Transacao } from '../../../models/transacao';
import { TransacaoService } from '../../../services/transacao.service';
import {
  MdbModalModule,
  MdbModalRef,
  MdbModalService,
} from 'mdb-angular-ui-kit/modal';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransacoesFormComponent } from '../transacoes-form/transacoes-form.component';
import Swal from 'sweetalert2';
import {
  StatusPagamentoDescricao,
  TipoPagamentoDescricao,
  TipoTransacaoDescricao,
} from '../../../models/enum';

@Component({
  selector: 'app-transacoes-list',
  standalone: true,
  imports: [MdbModalModule, FormsModule, CommonModule],
  templateUrl: './transacoes-list.component.html',
  styleUrl: './transacoes-list.component.scss',
})
export class TransacoesListComponent {
  lista: Transacao[] = [];
  pesquisa: string = '';
  resultados: any[] = [];

  statusPagamentoDescricao = StatusPagamentoDescricao;
  tipoPagamentoDescricao = TipoPagamentoDescricao;
  tipoTransacaoDescricao = TipoTransacaoDescricao;

  @Input('modoModal') modoModal: boolean = false;
  @Output('meuEvento') meuEvento = new EventEmitter();

  transacaoService = inject(TransacaoService);
  transacaoEdit!: Transacao;

  modalService = inject(MdbModalService);
  modalRef!: MdbModalRef<TransacoesFormComponent>;

  constructor() {
    this.buscarTodasTransacoes();
  }

  buscarTodasTransacoes() {
    this.transacaoService.buscarTodasTransacoes().subscribe({
      next: (listaRetornada) => {
        this.lista = listaRetornada;
      },
      error: (e) => {
        Swal.fire('Erro', e.error, 'error');
      },
    });
  }

  excluirTransacao(transacao: Transacao) {
    Swal.fire({
      title: 'Deseja mesmo deletar esta transação?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.transacaoService.excluirTransacao(transacao.id).subscribe({
          next: () => {
            Swal.fire({ title: 'Transação Deletada com Sucesso!', icon: 'success', confirmButtonText: 'Ok' });
            this.buscarTodasTransacoes();
          },
          error: (e) => {
            Swal.fire('Erro', e.error, 'error');
          },
        });
      }
    });
  }

  search() {
    if (!this.pesquisa || this.pesquisa.trim() === '') {
      this.buscarTodasTransacoes();
      return;
    }

    const valor = this.pesquisa.trim();

    if (!isNaN(Number(valor))) {
      const id = Number(valor);
      this.transacaoService.buscarTransacaoPorId(id).subscribe({
        next: (resultado) => {
          this.lista = resultado ? [resultado] : [];
        },
        error: () => {
          this.lista = [];
          Swal.fire('Aviso', 'Transação não encontrada', 'warning');
        }
      });
    } else {
      this.transacaoService.buscarTransacoesPorCaracteristica(valor).subscribe({
        next: (resultado) => {
          this.lista = resultado;
        },
        error: () => {
          this.lista = [];
          Swal.fire('Aviso', 'Nenhuma transação encontrada', 'warning');
        }
      });
    }
  }

  new() {
    this.transacaoEdit = new Transacao();
    this.abrirModal(this.transacaoEdit);
  }

  edit(transacao: Transacao) {
    this.transacaoEdit = { ...transacao };
    this.abrirModal(this.transacaoEdit);
  }

  abrirModal(transacao: Transacao) {
    this.modalRef = this.modalService.open(TransacoesFormComponent, {
      modalClass: 'custom-wide-modal',
      data: { transacao },
    });

    this.modalRef.onClose.subscribe(() => {
      this.buscarTodasTransacoes();
    });
  }

  selecionar(transacao: Transacao) {
    this.meuEvento.emit(transacao);
  }
}