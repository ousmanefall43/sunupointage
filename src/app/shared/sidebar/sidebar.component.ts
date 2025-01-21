import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';




@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule ],  // Assurez-vous que CommonModule est aussi importé si nécessaire
  
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  submenuVisible: boolean = false; // État du sous-menu

  constructor(private router: Router) {}

  // Toggle pour ouvrir/fermer le sous-menu
  toggleSubmenu(): void {
    this.submenuVisible = !this.submenuVisible;
  }

  // Garder le sous-menu ouvert lors de la navigation vers une sous-route
  keepSubmenuOpen(): void {
    this.submenuVisible = true;
  }

  // Déterminer si une des sous-routes est active
  isSubmenuActive(): boolean {
    return this.router.url.startsWith('/users');
  }

  ngOnInit(): void {
    // Vérifie si une sous-route est active au chargement
    this.submenuVisible = this.isSubmenuActive();
  }
}