import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ItensFormComponent } from '../itens-form/itens-form.component';
import { Itemnota } from '../../../models/itemnota';
import { ItemnotaService } from '../../../services/itemnota.service';
import { CambiohistoricoService } from '../../../services/cambiohistorico.service';
import {
  MdbModalModule,
  MdbModalRef,
  MdbModalService,
} from 'mdb-angular-ui-kit/modal';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-itens-list',
  standalone: true,
  imports: [MdbModalModule, FormsModule, CommonModule],
  templateUrl: './itens-list.component.html',
  styleUrl: './itens-list.component.scss',
})
export class ItensListComponent {
  @Input('modoModal') modoModal: boolean = false;
  @Output('meuEvento') meuEvento = new EventEmitter();

  lista: Itemnota[] = [];
  listaFiltrada: Itemnota[] = [];
  itemEdit!: Itemnota;
  taxaCambioAtual: number = 5.8;

  // ── Estado do dropdown customizado de filtro ────────────
  dropdownFiltroOpen: boolean = false;

  filtros = {
    pesquisa: '',
    tipoPesquisa: 'descricao' as 'id' | 'descricao',
    valorMin: null as number | null,
    valorMax: null as number | null,
  };

  modalService = inject(MdbModalService);
  modalRef!: MdbModalRef<any>;
  itemService = inject(ItemnotaService);
  cambioService = inject(CambiohistoricoService);

  constructor() {
    this.carregarTaxaCambio();
    this.buscarTodosItens();
  }

  carregarTaxaCambio() {
    this.cambioService.atualizarTaxaDia().subscribe({
      next: (taxa: any) => {
        if (typeof taxa === 'number') {
          this.taxaCambioAtual = taxa;
        } else if (taxa && taxa.cambio) {
          this.taxaCambioAtual = taxa.cambio;
        } else if (taxa && taxa.taxaUsdBrl) {
          this.taxaCambioAtual = taxa.taxaUsdBrl;
        }
      },
      error: (e) => {
        console.error('Erro ao carregar taxa de câmbio:', e);
      },
    });
  }

  buscarTodosItens() {
    this.itemService.buscarTodosItens().subscribe({
      next: (listaRetornada) => {
        this.lista = listaRetornada;
        this.listaFiltrada = [...this.lista];
      },
      error: (e) => {
        Swal.fire('Erro', e.error, 'error');
      },
    });
  }

  aplicarFiltros() {
    this.listaFiltrada = this.lista.filter((item) => {
      let passaPesquisa = true;
      if (this.filtros.pesquisa) {
        if (this.filtros.tipoPesquisa === 'id') {
          const id = Number(this.filtros.pesquisa);
          passaPesquisa = !isNaN(id) && item.id === id;
        } else {
          passaPesquisa = item.descricao
            .toLowerCase()
            .includes(this.filtros.pesquisa.toLowerCase());
        }
      }

      let passaValorMin = true;
      if (this.filtros.valorMin !== null) {
        passaValorMin = item.valorUnitario >= this.filtros.valorMin;
      }

      let passaValorMax = true;
      if (this.filtros.valorMax !== null) {
        passaValorMax = item.valorUnitario <= this.filtros.valorMax;
      }

      return passaPesquisa && passaValorMin && passaValorMax;
    });

    if (this.listaFiltrada.length === 0) {
      Swal.fire({
        title: 'Nenhum item encontrado',
        text: 'Tente ajustar os filtros',
        icon: 'info',
        confirmButtonText: 'Ok',
      });
    }
  }

  limparFiltros() {
    this.filtros = {
      pesquisa: '',
      tipoPesquisa: 'descricao',
      valorMin: null,
      valorMax: null,
    };
    this.listaFiltrada = [...this.lista];
  }

  calcularValorTotalEstoque(): number {
    return this.listaFiltrada.reduce((total, item) => {
      return total + item.quantidade * item.valorUnitario;
    }, 0);
  }

  search() {
    this.aplicarFiltros();
  }

  new() {
    this.itemEdit = new Itemnota();
    this.abrirModal(this.itemEdit);
  }

  edit(item: Itemnota) {
    this.itemEdit = item;
    this.abrirModal(this.itemEdit);
  }

  meuEventoTratamento(mensagem: any) {
    this.modalRef.close();
  }

  selecionar(item: Itemnota) {
    this.meuEvento.emit(item);
  }

  excluirItem(item: Itemnota) {
    Swal.fire({
      title: 'Deseja mesmo deletar este item?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.itemService.excluirItem(item.id).subscribe({
          next: () => {
            Swal.fire({ title: 'Item excluído com sucesso', icon: 'success', confirmButtonText: 'OK' });
            this.buscarTodosItens();
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Erro ao Excluir Item', confirmButtonText: 'OK' });
            this.buscarTodosItens();
          },
        });
      }
    });
  }

  abrirModal(item: Itemnota) {
    this.modalRef = this.modalService.open(ItensFormComponent, {
      data: { item },
    });

    this.modalRef.onClose.subscribe((result) => {
      if (result === 'saved') {
        this.buscarTodosItens();
      }
    });
  }
}