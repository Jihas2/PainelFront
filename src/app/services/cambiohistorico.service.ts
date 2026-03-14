import { HttpClient, HttpParams } from '@angular/common/http';
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

  atualizarTaxaDia(): Observable<Taxacambio>{
    return this.http.get<Taxacambio>(this.API + '/atualizar');
  }
  
  buscarUltimaTaxa(): Observable<Taxacambio> {
    return this.http.get<Taxacambio>(this.API + '/taxa-hoje');
  }
}