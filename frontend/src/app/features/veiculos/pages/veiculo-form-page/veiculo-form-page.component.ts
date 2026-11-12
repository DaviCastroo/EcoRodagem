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
import {
  CATEGORIAS_VEICULO,
  CategoriaVeiculo,
  PROPULSOES_LISTA,
  PROPULSOES_MAP,
  TipoPropulsao
} from '../../../../core/models/enums.model';
import { VeiculoRequest } from '../../../../core/models/veiculo.model';
import { ToastService } from '../../../../core/services/toast.service';
import { placaBrasileiraValidator } from '../../../../shared/validators/vehicle.validators';
import { VeiculoApiService } from '../../services/veiculo-api.service';

@Component({
  selector: 'app-veiculo-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './veiculo-form-page.component.html'
})
export class VeiculoFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly veiculoApi = inject(VeiculoApiService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias = CATEGORIAS_VEICULO;
  readonly propulsoes = PROPULSOES_LISTA;
  readonly marcasSugeridas = [
    'BYD', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'GWM', 'Honda',
    'Hyundai', 'Jeep', 'Nissan', 'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Volvo', 'Yamaha'
  ];

  readonly veiculoIdEdicao = signal<number | null>(null);
  readonly salvando = signal<boolean>(false);
  readonly carregandoDados = signal<boolean>(false);

  // Strictly Typed Reactive Form (angular-http-forms)
  readonly form = this.fb.group({
    apelido: ['', [Validators.required, Validators.maxLength(50)]],
    placa: ['', [Validators.required, placaBrasileiraValidator()]],
    marca: ['', [Validators.required, Validators.maxLength(50)]],
    modelo: ['', [Validators.required, Validators.maxLength(50)]],
    ano: ['', [Validators.maxLength(11)]],
    cor: ['', [Validators.maxLength(50)]],
    categoria: ['CARRO' as CategoriaVeiculo, [Validators.required]],
    propulsao: ['FLEX' as TipoPropulsao, [Validators.required]],
    hodometro: [0 as number | null, [Validators.required, Validators.min(0)]],
    tanqueComb: [50 as number | null, [Validators.min(1), Validators.max(999)]],
    capacidadeGnvM3: [null as number | null, [Validators.min(1), Validators.max(200)]],
    capacidadeBateriaKwh: [null as number | null, [Validators.min(1), Validators.max(500)]]
  });

  // Signal derivado da propulsão selecionada para Divulgação Progressiva (Lei de Hick)
  readonly propulsaoSelecionada = toSignal(
    this.form.controls.propulsao.valueChanges.pipe(startWith(this.form.controls.propulsao.value)),
    { initialValue: 'FLEX' as TipoPropulsao }
  );

  readonly metaPropulsaoAtual = computed(() => {
    const prop = this.propulsaoSelecionada() ?? 'FLEX';
    return PROPULSOES_MAP[prop];
  });

  ngOnInit(): void {
    this.configurarValidadoresDinamicosPorPropulsao();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.veiculoIdEdicao.set(id);
        this.carregarVeiculoParaEdicao(id);
      }
    }
  }

  selecionarCategoria(cat: CategoriaVeiculo): void {
    this.form.controls.categoria.setValue(cat);
  }

  selecionarPropulsao(prop: TipoPropulsao): void {
    this.form.controls.propulsao.setValue(prop);
  }

  formatarPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpo = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
    input.value = limpo;
    this.form.controls.placa.setValue(limpo, { emitEvent: false });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.info(
        'Verifique os campos destacados',
        'Preencha todos os campos obrigatórios antes de salvar o veículo.'
      );
      return;
    }

    const valores = this.form.getRawValue();
    const meta = this.metaPropulsaoAtual();

    const payload: VeiculoRequest = {
      apelido: (valores.apelido ?? '').trim(),
      placa: (valores.placa ?? '').trim().toUpperCase(),
      marca: (valores.marca ?? '').trim(),
      modelo: (valores.modelo ?? '').trim(),
      ano: valores.ano ? valores.ano.trim() : null,
      cor: valores.cor ? valores.cor.trim() : null,
      categoria: valores.categoria ?? 'CARRO',
      propulsao: valores.propulsao ?? 'FLEX',
      hodometro: Number(valores.hodometro ?? 0),
      tanqueComb: meta.requerTanqueLiquido ? Number(valores.tanqueComb) : null,
      capacidadeGnvM3: meta.requerCilindroGnv ? Number(valores.capacidadeGnvM3) : null,
      capacidadeBateriaKwh: meta.requerBateriaKwh ? Number(valores.capacidadeBateriaKwh) : null
    };

    this.salvando.set(true);
    const idEdicao = this.veiculoIdEdicao();
    const req$ = idEdicao
      ? this.veiculoApi.atualizar(idEdicao, payload)
      : this.veiculoApi.cadastrar(payload);

    req$
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (salvo) => {
          this.toastService.sucesso(
            idEdicao ? 'Alterações salvas' : 'Veículo cadastrado com sucesso!',
            `${salvo.apelido} (${salvo.placa}) já está disponível na sua frota.`
          );
          this.router.navigate(['/veiculos']);
        }
      });
  }

  temErro(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  private configurarValidadoresDinamicosPorPropulsao(): void {
    this.form.controls.propulsao.valueChanges
      .pipe(startWith(this.form.controls.propulsao.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((prop) => {
        const meta = PROPULSOES_MAP[prop ?? 'FLEX'];

        const ctrlTanque = this.form.controls.tanqueComb;
        const ctrlGnv = this.form.controls.capacidadeGnvM3;
        const ctrlBateria = this.form.controls.capacidadeBateriaKwh;

        if (meta.requerTanqueLiquido) {
          ctrlTanque.setValidators([Validators.required, Validators.min(1), Validators.max(999)]);
        } else {
          ctrlTanque.clearValidators();
          ctrlTanque.setValue(null, { emitEvent: false });
        }

        if (meta.requerCilindroGnv) {
          ctrlGnv.setValidators([Validators.required, Validators.min(1), Validators.max(200)]);
        } else {
          ctrlGnv.clearValidators();
          ctrlGnv.setValue(null, { emitEvent: false });
        }

        if (meta.requerBateriaKwh) {
          ctrlBateria.setValidators([Validators.required, Validators.min(1), Validators.max(500)]);
        } else {
          ctrlBateria.clearValidators();
          ctrlBateria.setValue(null, { emitEvent: false });
        }

        ctrlTanque.updateValueAndValidity({ emitEvent: false });
        ctrlGnv.updateValueAndValidity({ emitEvent: false });
        ctrlBateria.updateValueAndValidity({ emitEvent: false });
      });
  }

  private carregarVeiculoParaEdicao(id: number): void {
    this.carregandoDados.set(true);
    this.veiculoApi
      .buscarPorId(id)
      .pipe(
        finalize(() => this.carregandoDados.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (v) => {
          this.form.patchValue({
            apelido: v.apelido,
            placa: v.placa,
            marca: v.marca,
            modelo: v.modelo,
            ano: v.ano ?? '',
            cor: v.cor ?? '',
            categoria: v.categoria,
            propulsao: v.propulsao,
            hodometro: v.hodometroAtual,
            tanqueComb: v.tanqueComb,
            capacidadeGnvM3: v.capacidadeGnvM3,
            capacidadeBateriaKwh: v.capacidadeBateriaKwh
          });
        }
      });
  }
}
