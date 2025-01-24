import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component'; // Importer SidebarComponent
import { FormsModule } from '@angular/forms'; // Import pour ngModel
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SidebarComponent, FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  employees: any[] = []; // Liste complète des employés depuis l'API
  filteredUsers: any[] = []; // Liste filtrée pour affichage
  departments: string[] = []; // Liste des départements
  selectedDepartment: string = ''; // Département sélectionné pour filtrage
  searchQuery: string = ''; // Requête de recherche

  // Pagination
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; // Nombre d'éléments par page
  totalPages: number = 0; // Nombre total de pages

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>('http://localhost:8000/api/utilisateurs').subscribe(
      (data) => {
        this.employees = data;
        this.filteredUsers = data; // Initialiser la liste filtrée
        this.departments = [
          ...new Set(data.map((user) => user.departement).filter(Boolean)),
        ]; // Extraire les départements uniques
        this.updatePagination();
      },
      (error) => {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    );
  }

  // Mise à jour des données affichées sur la page courante
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredUsers = this.employees.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.employees.length / this.itemsPerPage);
  }

  // Méthode pour changer de page
  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  filterEmployees(department: string): void {
    const filtered = this.employees.filter((user) =>
      department ? user.departement === department : true
    );
    this.employees = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  filterData(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.employees.filter(
      (user) =>
        user.nom.toLowerCase().includes(query) ||
        user.prenom.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    this.employees = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  addItem(): void {
    alert('Ajouter un nouvel utilisateur');
  }

  editUser(user: any): void {
    console.log('Modifier utilisateur :', user);
  }

  viewUser(user: any): void {
    console.log('Voir utilisateur :', user);
  }

  blockUser(user: any): void {
    console.log('Bloquer utilisateur :', user);
  }

  deleteUser(user: any): void {
    console.log('Supprimer utilisateur :', user);
  }
}
