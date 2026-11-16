import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

  readonly sidebarRecolhida = signal<boolean>(this.lerEstadoInicialSidebar());

  readonly navItems: readonly NavItem[] = [
    { rota: '/dashboard', rotulo: 'Visão Geral', icone: 'fa-solid fa-chart-pie', exato: true },
    { rota: '/veiculos', rotulo: 'Meus Veículos', icone: 'fa-solid fa-car-side', exato: false },
    { rota: '/abastecimentos', rotulo: 'Abastecimentos', icone: 'fa-solid fa-gas-pump', exato: false },
    { rota: '/postos', rotulo: 'Postos & Preços', icone: 'fa-solid fa-map-location-dot', exato: false }
  ];

  alternarSidebar(): void {
    const novoEstado = !this.sidebarRecolhida();
    this.sidebarRecolhida.set(novoEstado);
    try {
      localStorage.setItem('ecorodagem_sidebar_recolhida', String(novoEstado));
    } catch {
      // Ignora caso localStorage esteja indisponível
    }
  }

  private lerEstadoInicialSidebar(): boolean {
    try {
      return localStorage.getItem('ecorodagem_sidebar_recolhida') === 'true';
    } catch {
      return false;
    }
  }
}
