import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth.service';
import { RFIDService } from '../../rfid.service';
import { Router } from '@angular/router'; // Router service
import { ServoService } from '../../servo.service'; // Importer le service ServoService


declare var bootstrap: any; // Déclaration globale pour Bootstrap

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule, DatePipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = 'Utilisateur';
  employees: any[] = [];
  filteredEmployees: any[] = [];
  paginatedEmployees: any[] = [];
  errorMessage: string | null = null; // Message d'erreur pour la carte invalide


  searchQuery: string = ''; // Recherche par téléphone
  selectedDepartment: string = ''; // Filtrage par département
  departments: string[] = ['Departement1', 'Departement2', 'Cohorte1'];

  isSidebarOpen: boolean = true; // État de la sidebar

  pageSize: number = 10; // Nombre d'éléments par page
  currentPage: number = 1; // Page actuelle
  totalEmployees: number = 0; // Total employés

  selectedUser: any = null; // Utilisateur détecté
  detectedCardInfo: any = null; // Informations de la carte RFID détectée
  detectionInterval: any = null; // Intervalle pour détecter la carte
  cardDetected: boolean = false; // Indicateur de détection de carte
  rfidData: any = null;


  currentDateTime: string = ''; // Date et heure en temps réel

  constructor(
    private authService: AuthService,
    private rfidService: RFIDService,
    private servoService: ServoService,
    private router: Router // Injection du router service
    
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
    this.listenForRFID(); // Écouter les événements RFID à l'initialisation
    this.updateDateTime(); // Initialiser la date et l'heure en temps réel

    // Mise à jour automatique de la date et l'heure toutes les secondes
    this.detectionInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    this.rfidService.stopListeningRFID(); // Fermer la connexion WebSocket proprement
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /* toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  } */
    toggleSidebar(): void {
      this.isSidebarOpen = !this.isSidebarOpen;
    
      const angle = this.isSidebarOpen ? 90 : 0; // Angle basé sur l'état de la sidebar
    
      this.servoService.setServoAngle(angle).subscribe({
        next: () => console.log(`Commande envoyée : Servo à ${angle}°`),
        error: (err: any) => console.error('Erreur lors de l\'envoi de la commande:', err),
      });
    }
    
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  fetchEmployees() {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.employees = data.map((user: any) => ({
          photo: user.photo || 'https://via.placeholder.com/40',
          prenom: user.prenom || '',
          nom: user.nom || '',
          telephone: user.telephone || '',
          email: user.email || '',
          departement: user.departement || user.cohorte || '',
          created_at: new Date().toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }), // Ajout de la date et heure actuelles
        }));
        this.filteredEmployees = [...this.employees];
        this.totalEmployees = this.filteredEmployees.length;
        this.paginateEmployees();
      },
      error: (err) => {
        this.errorMessage =
          'Une erreur est survenue lors du chargement des données.';
        console.error(err);
      },
    });
  }

  listenForRFID() {
    this.rfidService.getRFIDStatus().subscribe((data: any) => {
      console.log('Données reçues de la carte RFID:', data);
  
      if (data && data.user && data.user.nom) {
        this.detectedCardInfo = data;  // Stocke les informations dans une variable
        this.selectedUser = this.employees.find(
          (employee) => employee.nom === data.user.nom
        );
  
        // Si un utilisateur est trouvé, affiche le modal
        if (this.selectedUser) {
          this.errorMessage = null;  // Réinitialise le message d'erreur
          this.showModal();
        } else {
          this.errorMessage = 'Utilisateur non trouvé pour cette carte.';
          this.showModal();
          console.error('Utilisateur non trouvé pour le nom:', data.user.nom);
        }
      } else {
        this.errorMessage = 'Carte invalide ou données incorrectes.';
        this.showModal();
        console.error('Données invalides reçues:', data);
      }
    });
  }
  
  showModal() {
    const modalElement = document.getElementById('userModal');
    if (!modalElement) {
      console.error('Le modal n\'existe pas dans le DOM.');
      return;
    }
  
    const modalTitle = modalElement.querySelector('.modal-title');
    const modalBody = modalElement.querySelector('.modal-body');
  
    if (this.selectedUser) {
      // Si l'utilisateur est valide, affiche les informations utilisateur
      if (modalTitle) {
        modalTitle.textContent = `${this.selectedUser.prenom} ${this.selectedUser.nom}`;
      }
  
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="text-center">
            <img src="${this.selectedUser.photo}" alt="${this.selectedUser.nom} ${this.selectedUser.prenom}" class="img-fluid rounded-circle" style="width: 100px; height: 100px;">
          </div>
          <p><strong>Nom :</strong> ${this.selectedUser.nom}</p>
          <p><strong>Prénom :</strong> ${this.selectedUser.prenom}</p>
          <p><strong>Heure :</strong> ${this.currentDateTime}</p>
        `;
      }
    } else if (this.errorMessage) {
      // Si une erreur est présente, affiche le message d'erreur
      if (modalTitle) {
        modalTitle.textContent = 'Erreur de carte';
      }
  
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="text-center">
            <p>${this.errorMessage}</p>
          </div>
        `;
      }
    }
  
    // Créer une instance du modal Bootstrap et l'ouvrir
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
  
  

 /*  testModal() {
    console.log('Test Modal clicked');
    this.showModal();
  } */

  acceptUser() {
    if (this.selectedUser) {
      console.log('Utilisateur accepté:', this.selectedUser);
    }
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide(); // Fermer le modal après l'action
    }
  }
  savePointage(): void {
    if (this.rfidData) {
      const time = new Date().toISOString();
      const userId = this.detectedCardInfo?.user?.userId;
if (!userId) {
  console.error('Aucun userId trouvé dans les données détectées.');
  return;
}



      this.rfidService.savePointage(userId, this.rfidData.rfidUID, status, time).subscribe({
        next: (response) => {
          console.log('Pointage enregistré :', response);
          alert('Pointage enregistré avec succès.');
        },
        error: (err) => console.error('Erreur lors de l\'enregistrement du pointage :', err),
      });
    }
  }
  rejectUser() {
    alert('Utilisateur rejeté : ' + this.selectedUser?.prenom);
    this.selectedUser = null;
    this.cardDetected = false;
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(
      (employee) =>
        (this.selectedDepartment === '' ||
          employee.departement === this.selectedDepartment) &&
        (this.searchQuery === '' ||
          employee.telephone.includes(this.searchQuery))
    );
    this.paginateEmployees();
  }

  paginateEmployees() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  changePage(direction: string) {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
    this.paginateEmployees();
  }
}
