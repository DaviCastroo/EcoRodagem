import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CATEGORIAS_VEICULO, PROPULSOES_LISTA, TipoPropulsao } from '../../../../core/models/enums.model';
import { VeiculoResponse } from '../../../../core/models/veiculo.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { VeiculoApiService } from '../../services/veiculo-api.service';

@Component({
  selector: 'app-veiculo-list-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CurrencyPipe, PropulsionBadgeComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './veiculo-list-page.component.html'
})
export class VeiculoListPageComponent implements OnInit {
  private readonly veiculoApi = inject(VeiculoApiService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal<boolean>(true);
  readonly veiculos = signal<readonly VeiculoResponse[]>([]);
  readonly termoBusca = signal<string>('');
  readonly filtroPropulsao = signal<TipoPropulsao | 'TODOS'>('TODOS');
  readonly veiculoParaExcluir = signal<VeiculoResponse | null>(null);

  readonly propulsoes = PROPULSOES_LISTA;
  readonly categoriasMap = Object.fromEntries(CATEGORIAS_VEICULO.map((c) => [c.valor, c]));

  readonly veiculosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const prop = this.filtroPropulsao();

    return this.veiculos().filter((v) => {
      const batePropulsao = prop === 'TODOS' || v.propulsao === prop;
      const bateTermo =
        !termo ||
        v.apelido.toLowerCase().includes(termo) ||
        v.placa.toLowerCase().includes(termo) ||
        v.marca.toLowerCase().includes(termo) ||
        v.modelo.toLowerCase().includes(termo);
      return batePropulsao && bateTermo;
    });
  });

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  carregarVeiculos(): void {
    this.carregando.set(true);
    this.veiculoApi
      .listarTodos()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (lista) => this.veiculos.set(lista)
      });
  }

  atualizarBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value);
  }

  selecionarPropulsao(valor: string): void {
    this.filtroPropulsao.set(valor as TipoPropulsao | 'TODOS');
  }

  solicitarExclusao(veiculo: VeiculoResponse): void {
    this.veiculoParaExcluir.set(veiculo);
  }

  confirmarExclusao(): void {
    const alvo = this.veiculoParaExcluir();
    if (!alvo) {
      return;
    }

    this.veiculoApi
      .excluir(alvo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.sucesso(
            'Veículo removido',
            `O veículo "${alvo.apelido}" (${alvo.placa}) foi excluído da sua frota.`
          );
          this.veiculoParaExcluir.set(null);
          this.carregarVeiculos();
        }
      });
  }
}
