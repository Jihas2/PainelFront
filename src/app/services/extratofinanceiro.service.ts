import { inject, Injectable } from '@angular/core';
import { Extratofinanceiro } from '../models/extratofinanceiro';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExtratofinanceiroService {
  http = inject(HttpClient);
  API = `${environment.apiUrl}/api/extratos`;

  constructor() {}

  buscarExtratoPorData(data: string): Observable<Extratofinanceiro> {
    return this.http.get<Extratofinanceiro>(`${this.API}/data/${data}`);
  }

  buscarExtratosPorPeriodo(dataInicio: string, dataFim: string): Observable<Extratofinanceiro[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<Extratofinanceiro[]>(`${this.API}/periodo`, { params });
  }

  buscarExtratosMes(ano: number, mes: number): Observable<Extratofinanceiro[]> {
    return this.http.get<Extratofinanceiro[]>(`${this.API}/mes/${ano}/${mes}`);
  }

  buscarExtratosAno(ano: number): Observable<Extratofinanceiro[]> {
    return this.http.get<Extratofinanceiro[]>(`${this.API}/ano/${ano}`);
  }

  obterResumoMensal(ano: number, mes: number): Observable<any> {
    return this.http.get<any>(`${this.API}/resumo/mes/${ano}/${mes}`);
  }

  obterResumoAnual(ano: number): Observable<any> {
    return this.http.get<any>(`${this.API}/resumo/ano/${ano}`);
  }

  atualizarExtratoDia(data: string): Observable<Extratofinanceiro> {
    return this.http.post<Extratofinanceiro>(`${this.API}/atualizar/${data}`, {});
  }

  regenerarExtratosPeriodo(dataInicio: string, dataFim: string): Observable<string> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.post<string>(`${this.API}/regenerar`, {}, { params });
  }

  calcularSaldoAcumulado(data: string): Observable<any> {
    return this.http.get<any>(`${this.API}/saldo-acumulado/${data}`);
  }
}