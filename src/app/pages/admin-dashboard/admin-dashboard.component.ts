import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';

declare const bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, SidebarComponent],
})
export class AdminDashboardComponent implements AfterViewInit {
  roles: string[] = ['employe', 'apprenant']; // Liste des rôles disponibles
  specificFields: any = {}; // Contient les champs spécifiques pour les rôles

  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart(): void {
    const ctx = document.getElementById('chart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        datasets: [
          {
            label: 'Apprenants',
            data: [12, 19, 3, 5, 2, 3, 7],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Employés',
            data: [8, 15, 5, 10, 6, 4, 9],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  /**
   * Ouvrir la modale d'enregistrement
   */
  openRegistrationModal() {
    // Réinitialisation des champs spécifiques
    this.specificFields = {};

    // Afficher la modale
    const modalElement = document.getElementById('registrationModal') as HTMLElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  /**
   * Met à jour les champs spécifiques en fonction du rôle sélectionné
   * @param event 
   */
  updateSpecificFields(event: Event) {
    const specificFieldsContainer = document.getElementById('specificFields');
    if (!specificFieldsContainer) return;

    const role = (event.target as HTMLSelectElement).value;

    if (role === 'employe') {
      specificFieldsContainer.innerHTML = `
        <div class="mb-3">
          <label for="fonction" class="form-label">Fonction</label>
          <input type="text" class="form-control" id="fonction" name="fonction" ngModel />
        </div>
        <div class="mb-3">
          <label for="departement" class="form-label">Département</label>
          <input type="text" class="form-control" id="departement" name="departement" ngModel />
        </div>
      `;
    } else if (role === 'apprenant') {
      specificFieldsContainer.innerHTML = `
        <div class="mb-3">
          <label for="cohorte" class="form-label">Cohorte</label>
          <input type="text" class="form-control" id="cohorte" name="cohorte" ngModel />
        </div>
      `;
    }
  }

  /**
   * Soumettre le formulaire d'enregistrement
   */
  submitRegistrationForm() {
    const form = document.getElementById('registrationForm') as HTMLFormElement;
    const formData = new FormData(form);

    // Construction de l'objet utilisateur avec les champs spécifiques
    const userData: any = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      telephone: formData.get('telephone'),
      adresse: formData.get('adresse'),
      role: formData.get('role'),
    };

    // Ajouter les champs spécifiques en fonction du rôle
    if (userData.role === 'employe') {
      userData.fonction = formData.get('fonction'); // Ajout du champ fonction
      userData.departement = formData.get('departement');
    } else if (userData.role === 'apprenant') {
      userData.cohorte = formData.get('cohorte');
    }

    // Appeler le service pour créer un utilisateur
    this.authService.createUser(userData).subscribe(
      (response) => {
        console.log('Utilisateur créé avec succès', response);
        // Ouvrir le modal de succès
        const successModalElement = document.getElementById('successModal') as HTMLElement;
        const successModal = new bootstrap.Modal(successModalElement);
        successModal.show();
      },
      (error) => {
        console.error('Erreur lors de la création de l\'utilisateur', error);
      }
    );
  }
}
