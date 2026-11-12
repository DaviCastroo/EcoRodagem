import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AbastecimentoResponse } from '../../../../core/models/abastecimento.model';
import { COMBUSTIVEIS_MAP, TipoCombustivel } from '../../../../core/models/enums.model';
import { VeiculoResponse } from '../../../../core/models/veiculo.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { VeiculoApiService } from '../../../veiculos/services/veiculo-api.service';
import { AbastecimentoApiService } from '../../services/abastecimento-api.service';

@Component({
  selector: 'app-abastecimento-list-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DecimalPipe, DatePipe, PropulsionBadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './abastecimento-list-page.component.html'
})
export class AbastecimentoListPageComponent implements OnInit {
  private readonly abastecimentoApi = inject(AbastecimentoApiService);
  private readonly veiculoApi = inject(VeiculoApiService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly registros = signal<readonly AbastecimentoResponse[]>([]);
  readonly veiculos = signal<readonly VeiculoResponse[]>([]);
  readonly filtroVeiculoId = signal<number | null>(null);
  readonly filtroCombustivel = signal<TipoCombustivel | null>(null);
  readonly registroParaExcluir = signal<AbastecimentoResponse | null>(null);

  readonly combustiveis = Object.values(COMBUSTIVEIS_MAP);

  ngOnInit(): void {
    this.veiculoApi
      .listarTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => this.veiculos.set(lista));

    this.carregarRegistros();
  }

  carregarRegistros(): void {
    this.carregando.set(true);
    this.abastecimentoApi
      .listar(this.filtroVeiculoId(), this.filtroCombustivel())
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lista) => this.registros.set(lista)
      });
  }

  filtrarPorVeiculo(valor: string): void {
    this.filtroVeiculoId.set(valor ? Number(valor) : null);
    this.filtroCombustivel.set(null);
    this.carregarRegistros();
  }

  filtrarPorCombustivel(valor: string): void {
    this.filtroCombustivel.set(valor ? (valor as TipoCombustivel) : null);
    this.filtroVeiculoId.set(null);
    this.carregarRegistros();
  }

  confirmarExclusao(): void {
    const alvo = this.registroParaExcluir();
    if (!alvo) {
      return;
    }

    this.abastecimentoApi
      .excluir(alvo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.sucesso(
            'Registro removido',
            `O abastecimento de ${alvo.veiculoApelido} foi excluído.`
          );
          this.registroParaExcluir.set(null);
          this.carregarRegistros();
        }
      });
  }
}
