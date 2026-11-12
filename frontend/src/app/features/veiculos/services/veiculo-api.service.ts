import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VeiculoRequest, VeiculoResponse } from '../../../core/models/veiculo.model';

@Injectable({ providedIn: 'root' })
export class VeiculoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/veiculos`;

  listarTodos(): Observable<readonly VeiculoResponse[]> {
    return this.http.get<readonly VeiculoResponse[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<VeiculoResponse> {
    return this.http.get<VeiculoResponse>(`${this.baseUrl}/${id}`);
  }

  cadastrar(payload: VeiculoRequest): Observable<VeiculoResponse> {
    return this.http.post<VeiculoResponse>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: VeiculoRequest): Observable<VeiculoResponse> {
    return this.http.put<VeiculoResponse>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
