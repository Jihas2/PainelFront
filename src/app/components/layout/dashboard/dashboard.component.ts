import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CambiohistoricoService } from '../../../services/cambiohistorico.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, MdbFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: any = {};
  anoAtual: number = new Date().getFullYear();
  mesAtual: number = new Date().getMonth() + 1;
  taxaCambioAtual: number = 5.8;

  private chartDonut: Chart<'doughnut', number[], any> | null = null;
  private chartBar:   Chart<'bar',      number[], any> | null = null;

  dashboardService = inject(DashboardService);
  cambioService    = inject(CambiohistoricoService);

  ngOnInit(): void {
    this.carregarTaxaCambio();
    this.carregarDashboardAtual();
  }

  ngOnDestroy(): void {
    if (this.chartDonut) this.chartDonut.destroy();
    if (this.chartBar)   this.chartBar.destroy();
  }

  carregarTaxaCambio() {
    this.cambioService.atualizarTaxaDia().subscribe({
      next: (taxa: any) => {
        if (taxa?.taxaUsdBrl)  this.taxaCambioAtual = taxa.taxaUsdBrl;
        else if (taxa?.cambio) this.taxaCambioAtual = taxa.cambio;
      },
      error: (e) => console.error('Erro ao carregar taxa de câmbio:', e),
    });
  }

  carregarDashboardAtual(): void {
    this.dashboardService.obterDashboardAtual().subscribe({
      next: (data) => { this.dashboardData = data; this.atualizarGraficos(); },
      error: (e) => Swal.fire({ title: 'Erro ao carregar dashboard', text: e.error, icon: 'error', confirmButtonText: 'Ok' }),
    });
  }

  carregarDashboardMes(ano: number, mes: number): void {
    this.dashboardService.obterDashboardMes(ano, mes).subscribe({
      next: (data) => { this.dashboardData = data; this.atualizarGraficos(); },
      error: (e) => Swal.fire({ title: 'Erro ao carregar dashboard do mês', text: e.error, icon: 'error', confirmButtonText: 'Ok' }),
    });
  }

  carregarDashboardAno(ano: number): void {
    this.dashboardService.obterDashboardAno(ano).subscribe({
      next: (data) => { this.dashboardData = data; this.atualizarGraficos(); },
      error: (e) => Swal.fire({ title: 'Erro ao carregar dashboard do ano', text: e.error, icon: 'error', confirmButtonText: 'Ok' }),
    });
  }

  atualizarGraficos(): void {
    if (!this.dashboardData) return;
    setTimeout(() => { this.renderDonut(); this.renderBar(); }, 0);
  }

  renderDonut(): void {
    if (this.chartDonut) { this.chartDonut.destroy(); this.chartDonut = null; }

    const canvas = document.getElementById('dashboardChart') as HTMLCanvasElement;
    if (!canvas) return;

    const creditos = this.dashboardData.totalCreditosMes ?? this.dashboardData.totalCreditosAno ?? 0;
    const debitos  = this.dashboardData.totalDebitosMes  ?? this.dashboardData.totalDebitosAno  ?? 0;
    const saldo    = Math.abs(this.dashboardData.saldoMes ?? this.dashboardData.saldoAno ?? 0);

    this.chartDonut = new Chart<'doughnut'>(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Créditos', 'Débitos', 'Saldo'],
        datasets: [{
          data: [creditos, debitos, saldo],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
          ],
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Gráfico Financeiro', font: { size: 16 } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold' },
            formatter: (value: number, ctx: any) => {
              const data = ctx.chart.data.datasets[0].data as number[];
              const total = data.reduce((a, b) => a + b, 0);
              if (!total || value === 0) return '';
              return ((value / total) * 100).toFixed(1) + '%';
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed || 0;
                const brl = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const usd = (val / this.taxaCambioAtual).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                return `${ctx.label}: ${brl} (${usd})`;
              },
            },
          },
        },
      },
    });
  }

  renderBar(): void {
    if (this.chartBar) { this.chartBar.destroy(); this.chartBar = null; }

    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;

    const isDark    = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const tickColor = isDark ? '#8080b0' : '#6c757d';

    // Monta labels e dados dinamicamente com o que o backend retornar
    const campos: { label: string; key: string; cor: string }[] = [
      { label: 'Pagamentos',    key: 'totalPagamentosMes',    cor: 'rgba(245,158,11,0.8)'  },
      { label: 'Déb. Prazo',   key: 'totalDebitosPrazoMes',  cor: 'rgba(139,92,246,0.8)'  },
      { label: 'Créditos',     key: 'totalCreditosMes',      cor: 'rgba(16,185,129,0.8)'  },
      { label: 'Créd. Ano',    key: 'totalCreditosAno',      cor: 'rgba(16,185,129,0.6)'  },
      { label: 'Débitos',      key: 'totalDebitosMes',       cor: 'rgba(239,68,68,0.8)'   },
      { label: 'Déb. Ano',     key: 'totalDebitosAno',       cor: 'rgba(239,68,68,0.6)'   },
      { label: 'Saldo Mês',    key: 'saldoMes',              cor: 'rgba(59,130,246,0.8)'  },
      { label: 'Saldo Ano',    key: 'saldoAno',              cor: 'rgba(59,130,246,0.6)'  },
      { label: 'Acumulado',    key: 'saldoAcumulado',        cor: 'rgba(67,97,238,0.85)'  },
    ];

    const disponiveis = campos.filter(c => this.dashboardData[c.key] !== undefined);
    const labels = disponiveis.map(c => c.label);
    const dados  = disponiveis.map(c => this.dashboardData[c.key] ?? 0);
    const cores  = disponiveis.map(c => c.cor);

    this.chartBar = new Chart<'bar'>(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: dados,
          backgroundColor: cores,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y || 0;
                const brl = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const usd = (val / this.taxaCambioAtual).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                return `${brl} (${usd})`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11, weight: 'bold' } },
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 10 },
              callback: (val) => {
                const n = Number(val);
                if (Math.abs(n) >= 1000) return 'R$' + (n / 1000).toFixed(0) + 'k';
                return 'R$' + n.toFixed(0);
              },
            },
          },
        },
      },
    });
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}