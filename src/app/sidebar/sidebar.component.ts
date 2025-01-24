
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule], // Assurez-vous que CommonModule est inclus ici
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isUsersDropdownOpen = false;

  toggleUsersDropdown(): void {
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
