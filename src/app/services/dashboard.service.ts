import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  http = inject(HttpClient);
  API = `${environment.apiUrl}/api/dashboard`;

  constructor() {}

  obterDashboardAtual(): Observable<any> {
    return this.http.get<any>(this.API);
  }

  obterDashboardMes(ano: number, mes: number): Observable<any> {
    return this.http.get<any>(`${this.API}/mes/${ano}/${mes}`);
  }

  obterDashboardAno(ano: number): Observable<any> {
    return this.http.get<any>(`${this.API}/ano/${ano}`);
  }
}