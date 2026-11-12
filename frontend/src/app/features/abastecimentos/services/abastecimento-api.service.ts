import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AbastecimentoRequest,
  AbastecimentoResponse,
  PostoResumoResponse
} from '../../../core/models/abastecimento.model';
import { TipoCombustivel } from '../../../core/models/enums.model';

@Injectable({ providedIn: 'root' })
export class AbastecimentoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/abastecimentos`;

  listar(veiculoId?: number | null, combustivel?: TipoCombustivel | null): Observable<readonly AbastecimentoResponse[]> {
    let params = new HttpParams();
    if (veiculoId) {
      params = params.set('veiculoId', veiculoId);
    }
    if (combustivel) {
      params = params.set('combustivel', combustivel);
    }
    return this.http.get<readonly AbastecimentoResponse[]>(this.baseUrl, { params });
  }

  registrar(payload: AbastecimentoRequest): Observable<AbastecimentoResponse> {
    return this.http.post<AbastecimentoResponse>(this.baseUrl, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  resumirPorPosto(): Observable<readonly PostoResumoResponse[]> {
    return this.http.get<readonly PostoResumoResponse[]>(`${this.baseUrl}/postos`);
  }
}
