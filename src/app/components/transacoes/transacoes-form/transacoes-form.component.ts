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

  // ── Estados dos dropdowns customizados ──────────────────
  dropdownMoedaOpen = false;
  dropdownTipoOpen = false;
  dropdownStatusOpen = false;
  dropdownPagamentoOpen = false;

  // ── Listas com ícones e descrições ──────────────────────
  tipoTransacoes = [
    {
      value: TipoTransacao.CREDITO,
      label: 'Crédito',
      icon: 'fas fa-arrow-up',
      desc: 'Entrada de valor na conta',
    },
    {
      value: TipoTransacao.DEBITO,
      label: 'Débito',
      icon: 'fas fa-arrow-down',
      desc: 'Saída de valor da conta',
    },
  ];

  statusPagamentos = [
    {
      value: StatusPagamento.PENDENTE,
      label: 'Pendente',
      icon: 'fas fa-clock',
      desc: 'Aguardando pagamento',
    },
    {
      value: StatusPagamento.PAGO,
      label: 'Pago',
      icon: 'fas fa-check-circle',
      desc: 'Pagamento confirmado',
    },
    {
      value: StatusPagamento.CANCELADO,
      label: 'Cancelado',
      icon: 'fas fa-times-circle',
      desc: 'Transação cancelada',
    },
    {
      value: StatusPagamento.VENCIDO,
      label: 'Vencido',
      icon: 'fas fa-exclamation-circle',
      desc: 'Prazo de pagamento expirado',
    },
  ];

  tipoPagamentos = [
    {
      value: TipoPagamento.A_VISTA,
      label: 'À Vista',
      icon: 'fas fa-money-bill-wave',
      desc: 'Pagamento imediato',
    },
    {
      value: TipoPagamento.A_PRAZO,
      label: 'À Prazo',
      icon: 'fas fa-calendar-check',
      desc: 'Pagamento futuro acordado',
    },
    {
      value: TipoPagamento.PARCELADO,
      label: 'Parcelado',
      icon: 'fas fa-credit-card',
      desc: 'Dividido em parcelas',
    },
  ];

  moedas = [
    {
      value: 'BRL',
      label: 'Real (R$)',
      icon: 'fas fa-dollar-sign',
    },
    {
      value: 'USD',
      label: 'Dólar (US$)',
      icon: 'fas fa-dollar-sign',
    },
  ];

  constructor(public modalRef: MdbModalRef<TransacoesFormComponent>) {
    this.atualizarTaxaInicial();
  }

  ngOnInit() {
    if (this.transacao && this.transacao.id > 0) {
      this.buscarTransacaoPorId(this.transacao.id);
    }
  }

  // ── Métodos dos dropdowns customizados ──────────────────

  // Moeda
  getMoedaLabel(): string {
    return this.moedas.find(m => m.value === this.moedaSelecionada)?.label || 'Selecione...';
  }
  getMoedaIcon(): string {
    return this.moedas.find(m => m.value === this.moedaSelecionada)?.icon || 'fas fa-coins';
  }
  selecionarMoeda(moeda: any): void {
    this.moedaSelecionada = moeda.value;
    this.forcarAtualizacao();
    this.dropdownMoedaOpen = false;
  }

  // Tipo de Transação
  getTipoTransacaoLabel(): string {
    return this.tipoTransacoes.find(t => t.value === this.transacao.tipoTransacao)?.label || 'Selecione...';
  }
  getTipoTransacaoIcon(): string {
    return this.tipoTransacoes.find(t => t.value === this.transacao.tipoTransacao)?.icon || 'fas fa-exchange-alt';
  }
  selecionarTipoTransacao(tipo: any): void {
    this.transacao.tipoTransacao = tipo.value;
    this.dropdownTipoOpen = false;
  }

  // Status do Pagamento
  getStatusLabel(): string {
    return this.statusPagamentos.find(s => s.value === this.transacao.statusPagamento)?.label || 'Selecione...';
  }
  getStatusIcon(): string {
    return this.statusPagamentos.find(s => s.value === this.transacao.statusPagamento)?.icon || 'fas fa-circle';
  }
  selecionarStatus(status: any): void {
    this.transacao.statusPagamento = status.value;
    this.dropdownStatusOpen = false;
  }

  // Tipo de Pagamento
  getTipoPagamentoLabel(): string {
    return this.tipoPagamentos.find(t => t.value === this.transacao.tipoPagamento)?.label || 'Selecione...';
  }
  getTipoPagamentoIcon(): string {
    return this.tipoPagamentos.find(t => t.value === this.transacao.tipoPagamento)?.icon || 'fas fa-credit-card';
  }
  selecionarTipoPagamento(tp: any): void {
    this.transacao.tipoPagamento = tp.value;
    this.dropdownPagamentoOpen = false;
  }

  // ── Fechar dropdowns ao clicar fora ────────────────────
  fecharTodosDropdowns(): void {
    this.dropdownMoedaOpen = false;
    this.dropdownTipoOpen = false;
    this.dropdownStatusOpen = false;
    this.dropdownPagamentoOpen = false;
  }

  // ── Lógica original ─────────────────────────────────────

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