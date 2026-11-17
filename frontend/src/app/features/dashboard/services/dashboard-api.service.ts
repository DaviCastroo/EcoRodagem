import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AiChatResponse,
  AiDiagnosticsResponse,
  DashboardResponse
} from '../../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;
  private readonly iaUrl = `${environment.apiUrl}/ia`;

  obterResumo(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl);
  }

  obterDiagnosticoIa(): Observable<AiDiagnosticsResponse> {
    return this.http.get<AiDiagnosticsResponse>(`${this.iaUrl}/diagnostico`);
  }

  perguntarCopilotoIa(pergunta: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.iaUrl}/chat`, { pergunta });
  }
}
