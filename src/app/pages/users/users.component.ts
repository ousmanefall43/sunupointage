import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';  // Importer FormsModule ici
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SidebarComponent, FormsModule , CommonModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  selectedDepartment: string = '';  // Ajoutez cette propriété pour lier avec ngModel
  searchQuery: string = '';
    userType: string = 'employes';  // Par défaut, on montre les employés
    departments = ['Département A', 'Département B', 'Département C'];  // Liste des départements
    employees = [
      { id: 1, photo: 'photo1.jpg', firstName: 'Jean', matricule: 'J75821', lastName: 'Dupont', email: 'jean.dupont@example.com', role: 'utilisateur', selected: false },
      // Liste des employés (à remplir avec les données réelles)
    ];
    learners = [
      { id: 1, photo: 'photo1.jpg', firstName: 'Marc', lastName: 'Martin', email: 'marc.martin@example.com', role: 'utilisateur', matricule: 'A123', selected: false },
      // Liste des apprenants (à remplir avec les données réelles)
    ];
  
    constructor() { }
  
    ngOnInit(): void {
      // Charger les données initiales ou filtrer si nécessaire
    }
  
  // Méthode pour ajouter un élément (département ou cohorte)
  addItem() {
    alert('Ajouter un département ou une cohorte');
  }

    // Méthode pour gérer le changement de type d'utilisateur
    switchUserType(type: string): void {
      this.userType = type;
      // Filtrer les utilisateurs en fonction du type (employés ou apprenants)
    }
  
    // Filtrer les employés par département
    filterEmployees(department: string) {
      // Code pour filtrer les employés en fonction du département sélectionné
    }
  
    // Sélectionner/Désélectionner tous les employés ou apprenants
    selectAllUsers() {
      const list = this.userType === 'employes' ? this.employees : this.learners;
      const selectedAll = list.every(user => user.selected);
      list.forEach(user => user.selected = !selectedAll);
    }
  
    // Actions : Modifier, Voir, Bloquer, Supprimer
    editUser(user: any) { }
    viewUser(user: any) { }
    blockUser(user: any) { }
    deleteUser(user: any) { }



    // Méthode pour filtrer les utilisateurs en fonction de la recherche
  filterData() {
    if (this.userType === 'employes') {
      // Filtrer les employés en fonction de la recherche
      this.employees = this.employees.filter(user => 
        user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else if (this.userType === 'apprenants') {
      // Filtrer les apprenants en fonction de la recherche
      this.learners = this.learners.filter(user => 
        user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.matricule.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
  }
  

