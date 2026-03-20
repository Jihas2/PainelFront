import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Transacao } from '../../../models/transacao';
import { ActivatedRoute, Router } from '@angular/router';
import { TransacaoService } from '../../../services/transacao.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatusPagamento, TipoPagamento, TipoTransacao } from '../../../models/enum';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MdbModalModule, MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Taxacambio } from '../../../models/taxacambio';
import { CambiohistoricoService } from '../../../services/cambiohistorico.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transacoes-form',
  standalone: true,
  imports: [
    FormsModule,
    MdbFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MdbModalModule,
  ],
  templateUrl: './transacoes-form.component.html',
  styleUrl: './transacoes-form.component.scss',
})
export class TransacoesFormComponent {
  @Input('transacao') transacao!: Transacao;
  @Output('meuEvento') meuEvento = new EventEmitter();

  rotaActivada = inject(ActivatedRoute);
  roteador = inject(Router);
  cambioService = inject(CambiohistoricoService);
  transacaoService = inject(TransacaoService);
  modalService = inject(MdbModalService);

  taxaCambio!: Taxacambio;
  moedaSelecionada: string = 'BRL';
  valorEntrada: number = 0;

  quantidadeItens: number = 0;
  quantidadeItensOriginal: number = 0;

  tipoTransacoes = [
    { value: TipoTransacao.CREDITO, label: 'Crédito' },
    { value: TipoTransacao.DEBITO, label: 'Débito' },
  ];

  statusPagamentos = [
    { value: StatusPagamento.PENDENTE, label: 'Pendente' },
    { value: StatusPagamento.PAGO, label: 'Pago' },
    { value: StatusPagamento.CANCELADO, label: 'Cancelado' },
    { value: StatusPagamento.VENCIDO, label: 'Vencido' },
  ];

  tipoPagamentos = [
    { value: TipoPagamento.A_VISTA, label: 'À Vista' },
    { value: TipoPagamento.A_PRAZO, label: 'À Prazo' },
    { value: TipoPagamento.PARCELADO, label: 'Parcelado' },
  ];

  moedas = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar (US$)' },
  ];

  constructor(public modalRef: MdbModalRef<TransacoesFormComponent>) {
    this.atualizarTaxaInicial();
  }

  ngOnInit() {
    if (this.transacao && this.transacao.id > 0) {
      this.buscarTransacaoPorId(this.transacao.id);
    }
  }

  obterValorEmReais(): number {
    if (this.valorEntrada == null) return 0;
    if (!this.taxaCambio || !this.taxaCambio.cambio) {
      return this.moedaSelecionada === 'BRL' ? this.valorEntrada : 0;
    }
    return this.moedaSelecionada === 'USD'
      ? this.valorEntrada * this.taxaCambio.cambio
      : this.valorEntrada;
  }

  obterValorEmDolares(): number {
    if (this.valorEntrada == null) return 0;
    if (!this.taxaCambio || !this.taxaCambio.cambio) {
      return this.moedaSelecionada === 'USD' ? this.valorEntrada : 0;
    }
    return this.moedaSelecionada === 'BRL'
      ? this.valorEntrada / this.taxaCambio.cambio
      : this.valorEntrada;
  }

  atualizarTaxaInicial() {
    this.cambioService.atualizarTaxaDia().subscribe({
      next: (taxa: any) => {
        if (taxa && taxa.taxaUsdBrl) {
          this.taxaCambio = { cambio: taxa.taxaUsdBrl };
        } else if (taxa && taxa.cambio) {
          this.taxaCambio = { cambio: taxa.cambio };
        } else if (typeof taxa === 'number') {
          this.taxaCambio = { cambio: taxa };
        } else {
          this.taxaCambio = { cambio: 5.8 };
          console.warn('Taxa de câmbio não encontrada, usando valor padrão.');
        }
      },
      error: (e) => {
        this.taxaCambio = { cambio: 5.8 };
        console.error('Erro ao carregar taxa de câmbio:', e);
      },
    });
  }

  forcarAtualizacao() {
    this.obterValorEmReais();
    this.obterValorEmDolares();
  }

  buscarTransacaoPorId(id: number) {
    this.transacaoService.buscarTransacaoComItens(id).subscribe({
      next: (retorno) => {
        this.transacao = retorno;
        if (!this.transacao.itens) {
          this.transacao.itens = [];
        }
        this.quantidadeItens = this.transacao.itens.length;
        this.quantidadeItensOriginal = this.transacao.itens.length;
        this.valorEntrada = this.transacao.valorReais;
        this.moedaSelecionada = 'BRL';
      },
      error: (e) => {
        Swal.fire('Erro', e.error, 'error');
      },
    });
  }

  save() {
    if (this.moedaSelecionada === 'USD') {
      this.transacao.valorDolares = this.valorEntrada;
      this.transacao.valorReais = this.valorEntrada * this.taxaCambio.cambio;
    } else {
      this.transacao.valorReais = this.valorEntrada;
      this.transacao.valorDolares = this.valorEntrada / this.taxaCambio.cambio;
    }

    const transacaoParaEnviar = {
      ...this.transacao,
      taxaCambio: this.taxaCambio.cambio,
    };

    if (this.transacao.id > 0) {
      const requests = [];
      requests.push(
        this.transacaoService.atualizarTransacao(this.transacao.id, transacaoParaEnviar as any)
      );
      if (this.quantidadeItens !== this.quantidadeItensOriginal) {
        requests.push(
          this.transacaoService.atualizarQuantidadeItens(this.transacao.id, this.quantidadeItens)
        );
      }
      forkJoin(requests).subscribe({
        next: () => this.finalizarSucesso('Transação Atualizada com Sucesso!'),
        error: (e) => this.finalizarErro(e),
      });
    } else {
      this.transacaoService.criarTransacao(transacaoParaEnviar as any).subscribe({
        next: (transacaoCriada) => {
          if (this.quantidadeItens > 0) {
            this.transacaoService.atualizarQuantidadeItens(transacaoCriada.id, this.quantidadeItens).subscribe({
              next: () => this.finalizarSucesso('Transação Criada com Sucesso!'),
              error: (e) => this.finalizarErro(e),
            });
          } else {
            this.finalizarSucesso('Transação Criada com Sucesso!');
          }
        },
        error: (e) => this.finalizarErro(e),
      });
    }
  }

  atualizarTaxa() {
    this.atualizarTaxaInicial();
  }

  finalizarSucesso(mensagem: string) {
    Swal.fire(mensagem, '', 'success');
    this.meuEvento.emit('saved');
    this.close();
  }

  finalizarErro(e: any) {
    Swal.fire('Erro', e.error || 'Erro ao processar a requisição', 'error');
  }

  close() {
    this.modalRef.close();
  }
}