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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { AbastecimentoRequest } from '../../../../core/models/abastecimento.model';
import {
  COMBUSTIVEIS_MAP,
  CombustivelMeta,
  PROPULSOES_MAP,
  TipoCombustivel
} from '../../../../core/models/enums.model';
import { VeiculoResponse } from '../../../../core/models/veiculo.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PropulsionBadgeComponent } from '../../../../shared/components/propulsion-badge/propulsion-badge.component';
import { hodometroMaiorQueAnteriorValidator } from '../../../../shared/validators/vehicle.validators';
import { VeiculoApiService } from '../../../veiculos/services/veiculo-api.service';
import { AbastecimentoApiService } from '../../services/abastecimento-api.service';

@Component({
  selector: 'app-abastecimento-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DecimalPipe, PropulsionBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './abastecimento-form-page.component.html'
})
export class AbastecimentoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly veiculoApi = inject(VeiculoApiService);
  private readonly abastecimentoApi = inject(AbastecimentoApiService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly veiculos = signal<readonly VeiculoResponse[]>([]);
  readonly carregandoVeiculos = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);
  readonly hodometroMinimoRef = signal<number | null>(null);

  readonly hojeIso = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.group({
    veiculoId: [null as number | null, [Validators.required]],
    combustivel: ['GASOLINA' as TipoCombustivel, [Validators.required]],
    dataAbastecimento: [this.hojeIso, [Validators.required]],
    litros: [null as number | null, [Validators.required, Validators.min(0.01)]],
    valorTotal: [null as number | null, [Validators.required, Validators.min(0.01)]],
    hodometro: [
      null as number | null,
      [Validators.required, Validators.min(0.1), hodometroMaiorQueAnteriorValidator(() => this.hodometroMinimoRef())]
    ],
    locPosto: ['', [Validators.maxLength(100)]],
    tanqueCheio: [true]
  });

  readonly valoresForm = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  readonly veiculoSelecionado = computed<VeiculoResponse | null>(() => {
    const id = Number(this.valoresForm().veiculoId);
    if (!id) {
      return null;
    }
    return this.veiculos().find((v) => v.id === id) ?? null;
  });

  readonly hodometroAnterior = computed<number | null>(() => {
    return this.veiculoSelecionado()?.hodometroAtual ?? null;
  });

  readonly combustiveisCompativeis = computed<readonly CombustivelMeta[]>(() => {
    const veiculo = this.veiculoSelecionado();
    if (!veiculo) {
      return Object.values(COMBUSTIVEIS_MAP);
    }
    const propMeta = PROPULSOES_MAP[veiculo.propulsao];
    return propMeta.combustiveisAceitos.map((c) => COMBUSTIVEIS_MAP[c]);
  });

  readonly metaCombustivelAtual = computed<CombustivelMeta>(() => {
    const comb = (this.valoresForm().combustivel ?? 'GASOLINA') as TipoCombustivel;
    return COMBUSTIVEIS_MAP[comb];
  });

  // Cálculos em Tempo Real para o Card de Preview (Heurística de Nielsen — Visibilidade do Status)
  readonly previewCalculos = computed(() => {
    const val = this.valoresForm();
    const qtd = Number(val.litros ?? 0);
    const total = Number(val.valorTotal ?? 0);
    const hodAtual = Number(val.hodometro ?? 0);
    const hodAnt = this.hodometroAnterior();

    const precoUnitario = qtd > 0 && total > 0 ? total / qtd : null;
    const kmPercorridos = hodAnt !== null && hodAtual > hodAnt ? hodAtual - hodAnt : null;
    const mediaConsumo = kmPercorridos !== null && qtd > 0 ? kmPercorridos / qtd : null;
    const custoPorKm = kmPercorridos !== null && total > 0 ? total / kmPercorridos : null;

    return {
      precoUnitario,
      kmPercorridos,
      mediaConsumo,
      custoPorKm
    };
  });

  ngOnInit(): void {
    const queryVeiculoId = Number(this.route.snapshot.queryParamMap.get('veiculoId'));

    this.veiculoApi
      .listarTodos()
      .pipe(
        finalize(() => this.carregandoVeiculos.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((lista) => {
        this.veiculos.set(lista);
        if (lista.length > 0) {
          const inicial = lista.find((v) => v.id === queryVeiculoId) ?? lista[0];
          this.selecionarVeiculo(inicial);
        }
      });
  }

  selecionarVeiculo(veiculo: VeiculoResponse): void {
    const propMeta = PROPULSOES_MAP[veiculo.propulsao];
    const primeiroCombustivel = propMeta.combustiveisAceitos[0];
    this.hodometroMinimoRef.set(veiculo.hodometroAtual);

    this.form.patchValue({
      veiculoId: veiculo.id,
      combustivel: primeiroCombustivel
    });
    this.form.controls.hodometro.updateValueAndValidity();
  }

  selecionarCombustivel(comb: TipoCombustivel): void {
    this.form.controls.combustivel.setValue(comb);
  }

  salvar(): void {
    this.form.controls.hodometro.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.info(
        'Verifique os dados informados',
        'Corrija os campos destacados antes de registrar o abastecimento.'
      );
      return;
    }

    const raw = this.form.getRawValue();
    const payload: AbastecimentoRequest = {
      veiculoId: Number(raw.veiculoId),
      combustivel: raw.combustivel ?? 'GASOLINA',
      tanqueCheio: Boolean(raw.tanqueCheio),
      litros: Number(raw.litros),
      valorTotal: Number(raw.valorTotal),
      hodometro: Number(raw.hodometro),
      locPosto: raw.locPosto ? raw.locPosto.trim() : null,
      dataAbastecimento: raw.dataAbastecimento ?? this.hojeIso
    };

    this.salvando.set(true);
    this.abastecimentoApi
      .registrar(payload)
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.toastService.sucesso(
            'Registro salvo com sucesso!',
            `Média calculada: ${res.mediaConsumoKmPorLitro.toFixed(2)} ${res.unidadeConsumo} (${res.kmPercorridos.toFixed(1)} km percorridos).`
          );
          this.router.navigate(['/abastecimentos']);
        }
      });
  }

  temErro(campo: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.controls[campo];
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
