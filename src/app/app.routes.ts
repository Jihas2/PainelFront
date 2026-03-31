import { Routes } from '@angular/router';
import { PrincipalComponent } from './components/layout/principal/principal.component';
import { DashboardComponent } from './components/layout/dashboard/dashboard.component';
import { ItensListComponent } from './components/itens/itens-list/itens-list.component';
import { ItensFormComponent } from './components/itens/itens-form/itens-form.component';
import { TransacoesListComponent } from './components/transacoes/transacoes-list/transacoes-list.component';
import { TransacoesFormComponent } from './components/transacoes/transacoes-form/transacoes-form.component';
import { ExtratosListComponent } from './components/extratos/extratos-list/extratos-list.component';
import { UsuariosFormComponent } from './components/usuarios/usuarios-form/usuarios-form.component';
import { CadastrosListComponent } from './components/cadastros/cadastros-list/cadastros-list.component';
import { AuditoriaListComponent } from './components/auditoria/auditoria-list/auditoria-list.component';
import { LoginComponent } from './components/layout/login/login.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';
import { DemandanteGuard } from './guards/demandante.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: UsuariosFormComponent },
  {
    path: 'principal',
    component: PrincipalComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'itens', component: ItensListComponent },
      { path: 'itens/new', component: ItensFormComponent },
      { path: 'itens/edit/:id', component: ItensFormComponent },
      { path: 'transacoes', component: TransacoesListComponent },
      { path: 'transacoes/new', component: TransacoesFormComponent },
      { path: 'transacoes/edit/:id', component: TransacoesFormComponent },
      { path: 'extratos', component: ExtratosListComponent },
      { path: 'usuarios/new', component: UsuariosFormComponent, canActivate: [adminGuard] },
      { path: 'cadastros', component: CadastrosListComponent, canActivate: [DemandanteGuard] },
      { path: 'auditoria', component: AuditoriaListComponent, canActivate: [DemandanteGuard] },
    ],
  },
];