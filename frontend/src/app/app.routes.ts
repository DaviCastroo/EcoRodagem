import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        title: 'Visão Geral — EcoRodagem',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          )
      },
      {
        path: 'veiculos',
        title: 'Meus Veículos — EcoRodagem',
        loadComponent: () =>
          import('./features/veiculos/pages/veiculo-list-page/veiculo-list-page.component').then(
            (m) => m.VeiculoListPageComponent
          )
      },
      {
        path: 'veiculos/novo',
        title: 'Cadastrar Veículo — EcoRodagem',
        loadComponent: () =>
          import('./features/veiculos/pages/veiculo-form-page/veiculo-form-page.component').then(
            (m) => m.VeiculoFormPageComponent
          )
      },
      {
        path: 'veiculos/:id/editar',
        title: 'Editar Veículo — EcoRodagem',
        loadComponent: () =>
          import('./features/veiculos/pages/veiculo-form-page/veiculo-form-page.component').then(
            (m) => m.VeiculoFormPageComponent
          )
      },
      {
        path: 'abastecimentos',
        title: 'Abastecimentos & Recargas — EcoRodagem',
        loadComponent: () =>
          import(
            './features/abastecimentos/pages/abastecimento-list-page/abastecimento-list-page.component'
          ).then((m) => m.AbastecimentoListPageComponent)
      },
      {
        path: 'abastecimentos/novo',
        title: 'Registrar Abastecimento — EcoRodagem',
        loadComponent: () =>
          import(
            './features/abastecimentos/pages/abastecimento-form-page/abastecimento-form-page.component'
          ).then((m) => m.AbastecimentoFormPageComponent)
      },
      {
        path: 'postos',
        title: 'Postos & Preços — EcoRodagem',
        loadComponent: () =>
          import('./features/postos/pages/postos-ranking-page/postos-ranking-page.component').then(
            (m) => m.PostosRankingPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
