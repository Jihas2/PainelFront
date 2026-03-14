import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CambiohistoricoService } from '../../../services/cambiohistorico.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
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

  private chart: Chart<'doughnut', number[], any> | null = null;

  dashboardService = inject(DashboardService);
  cambioService = inject(CambiohistoricoService);

  constructor() {}

  ngOnInit(): void {
    this.carregarTaxaCambio();
    this.carregarDashboardAtual();
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }

  carregarTaxaCambio() {
    this.cambioService.atualizarTaxaDia().subscribe({
      next: (taxa: any) => {
        if (taxa && taxa.taxaUsdBrl) {
          this.taxaCambioAtual = taxa.taxaUsdBrl;
        }
        console.log('Taxa de câmbio carregada:', this.taxaCambioAtual);
      },
      error: (e) => {
        console.error('Erro ao carregar taxa de câmbio:', e);
      },
    });
  }

  carregarDashboardAtual(): void {
    this.dashboardService.obterDashboardAtual().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.atualizarGrafico();
      },
      error: (e) =>
        Swal.fire({
          title: 'Erro ao carregar a dashboard atual',
          text: e.error,
          icon: 'error',
          confirmButtonText: 'Ok',
        }),
    });
  }

  carregarDashboardMes(ano: number, mes: number): void {
    this.dashboardService.obterDashboardMes(ano, mes).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.atualizarGrafico();
      },
      error: (e) =>
        Swal.fire({
          title: 'Erro ao carregar a dashboard do mês',
          text: e.error,
          icon: 'error',
          confirmButtonText: 'Ok',
        }),
    });
  }

  carregarDashboardAno(ano: number): void {
    this.dashboardService.obterDashboardAno(ano).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.atualizarGrafico();
      },
      error: (e) =>
        Swal.fire({
          title: 'Erro ao carregar a dashboard do ano',
          text: e.error,
          icon: 'error',
          confirmButtonText: 'Ok',
        }),
    });
  }

  atualizarGrafico(): void {
    if (!this.dashboardData) return;

    const labels = ['Créditos', 'Débitos', 'Saldo'];
    const data = [
      this.dashboardData.totalCreditosMes ??
        this.dashboardData.totalCreditosAno ??
        0,
      this.dashboardData.totalDebitosMes ??
        this.dashboardData.totalDebitosAno ??
        0,
      this.dashboardData.saldoMes ?? this.dashboardData.saldoAno ?? 0,
    ];

    setTimeout(() => {
      if (this.chart) this.chart.destroy();

      const canvas = document.getElementById(
        'dashboardChart'
      ) as HTMLCanvasElement;
      if (!canvas) return;

      this.chart = new Chart<'doughnut'>(canvas, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)',
              ],
              borderColor: '#fff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Gráfico Financeiro',
              font: { size: 18 },
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold' },
              formatter: (value: number, context: any) => {
                const dataArray = context.chart.data.datasets[0].data as number[];
                const total = dataArray.reduce((a, b) => a + b, 0);
                const percentage = total
                  ? ((value / total) * 100).toFixed(1) + '%'
                  : '0%';
                return percentage;
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const formattedBRL = value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  });
                  const formattedUSD = (value / this.taxaCambioAtual).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  });
                  return `${label}: ${formattedBRL} (${formattedUSD})`;
                },
              },
            },
          },
        },
      });
    }, 0);
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}