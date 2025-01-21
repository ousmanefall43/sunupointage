import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,  // Ce composant est autonome
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SidebarComponent],  // Importer SidebarComponent ici
})
export class DashboardComponent {
  // Logic for DashboardComponent
}


