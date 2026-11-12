import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  COMBUSTIVEIS_MAP,
  PROPULSOES_MAP,
  TipoCombustivel,
  TipoPropulsao
} from '../../../core/models/enums.model';

@Component({
  selector: 'app-propulsion-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (meta(); as info) {
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
        [class]="info.badgeClasses"
      >
        <i [class]="info.icone" aria-hidden="true"></i>
        <span>{{ info.rotulo }}</span>
      </span>
    }
  `
})
export class PropulsionBadgeComponent {
  readonly propulsao = input<TipoPropulsao | null>(null);
  readonly combustivel = input<TipoCombustivel | null>(null);

  readonly meta = computed(() => {
    const prop = this.propulsao();
    if (prop && PROPULSOES_MAP[prop]) {
      return PROPULSOES_MAP[prop];
    }
    const comb = this.combustivel();
    if (comb && COMBUSTIVEIS_MAP[comb]) {
      return COMBUSTIVEIS_MAP[comb];
    }
    return null;
  });
}
