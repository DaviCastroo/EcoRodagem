import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastService } from '../services/toast.service';

interface NavItem {
  readonly rota: string;
  readonly rotulo: string;
  readonly icone: string;
  readonly exato: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  readonly toastService = inject(ToastService);

  readonly navItems: readonly NavItem[] = [
    { rota: '/dashboard', rotulo: 'Visão Geral', icone: 'fa-solid fa-chart-pie', exato: true },
    { rota: '/veiculos', rotulo: 'Meus Veículos', icone: 'fa-solid fa-car-side', exato: false },
    { rota: '/abastecimentos', rotulo: 'Abastecimentos', icone: 'fa-solid fa-gas-pump', exato: false },
    { rota: '/postos', rotulo: 'Postos & Preços', icone: 'fa-solid fa-map-location-dot', exato: false }
  ];
}
