import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; 
import { DashboardComponent } from './pages/dashboard/dashboard.component'; 
import { StructuresComponent } from './pages/structures/structures.component';
import { UsersComponent } from './pages/users/users.component';
import { PointagesComponent } from './pages/pointages/pointages.component';
import { EmployesComponent } from './pages/users/employes/employes.component';
import { ApprenantsComponent } from './pages/users/apprenants/apprenants.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'structures', component: StructuresComponent },
  { path: 'users', component: UsersComponent },
  { path: 'users/employes', component: EmployesComponent },
  { path: 'users/apprenants', component: ApprenantsComponent },
  { path: 'pointages', component: PointagesComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Redirection par défaut vers /login
];
