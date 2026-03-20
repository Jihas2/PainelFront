import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Taxacambio } from '../models/taxacambio';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CambiohistoricoService {
  http = inject(HttpClient);
  API = `${environment.apiUrl}/cambio`;

  constructor() {}

  atualizarTaxaDia(): Observable<any> {
    return this.http.get<any>(this.API + '/atualizar');
  }

  buscarUltimaTaxa(): Observable<Taxacambio> {
    return this.http.get<Taxacambio>(this.API + '/taxa-hoje');
  }
}