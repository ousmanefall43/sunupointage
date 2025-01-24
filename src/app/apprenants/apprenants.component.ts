import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';  // Ajoutez cette ligne
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprenantService } from '../apprenant.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';




interface Apprenant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  adresse?: string;
  photo?: File;
  fonction?: string;
  matricule?: string;
  selected?: boolean;
  is_active?: boolean; // Make it optional
  telephone?: string;
  role?:'';
}

interface Cohorte {
  id: number;
  nom: string;
}


@Component({
  selector: 'app-apprenants',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, ],
  templateUrl: './apprenants.component.html',
  styleUrls: ['./apprenants.component.css']
})
export class ApprenantsComponent implements OnInit {
  apprenants: Apprenant[] = [];
  cohortes: Cohorte[] = [];
  selectedCohorte: string = '677bdd89d371305888075814';
  selectedApprenants: Apprenant[] = [];
  page: number = 1;
  size: number = 5;
  apprenant: any = null; // Pour stocker les informations de l'apprenant
  showModal: boolean = false; // Variable pour contrôler la visibilité du modal

  currentPages: number = 1;
  totalApprenants: number = 6;  // Nombre total d'apprenants


  notificationMessage: string = '';
  notificationClass: string = '';
  selectedApprenant: any;
  showApprenantModal: boolean = false;

  isEditing: boolean = false; // Contrôle l'affichage du formulaire d'édition
  errorMessages: string[] = []; // Contient les messages d'erreurs de validatio

  isLoading: boolean = false;  // Ajoutez cette ligne pour gérer le loader
  displayedApprenants: Apprenant[] = []; // Apprenants affichés pour la page actuelle


   // Méthode pour fermer le modal
   closeModal(): void {
    this.showModal = false;
    this.apprenant = null; // Réinitialiser les données de l'apprenant
  }

  // Variables pour la gestion des modals
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  actionToConfirm: Function | null = null;

  isImporting = false; // pour afficher ou cacher le modal
  selectedFile: File | null = null;
  cohorteId: string = ''; // Exemple de cohorteId sous forme de string (à ajuster selon votre contexte)



  constructor(private apprenantService: ApprenantService , private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCohortes();
    this.loadApprenants();
  }

  loadCohortes(): void {
    this.apprenantService.getCohortes().subscribe(
      (data: Cohorte[]) => {
        this.cohortes = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des cohortes :', error);
      }
    );
  }

  loadApprenants(): void {
    this.apprenantService.getApprenantsByCohorte(this.selectedCohorte).subscribe(
      (response: Apprenant[]) => {
        this.apprenants = response || [];
        this.totalApprenants = this.apprenants.length;
        this.updateDisplayedApprenants(); // Initialiser les apprenants affichés
      },
      (error) => {
        console.error('Erreur lors de la récupération des apprenants :', error);
        this.apprenants = [];
        this.displayedApprenants = []; // Réinitialiser en cas d'erreur
      }
    );
  }
  

  updateDisplayedApprenants(): void {
    const startIndex = (this.page - 1) * this.size;
    const endIndex = startIndex + this.size;
    this.displayedApprenants = this.apprenants.slice(startIndex, endIndex);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= Math.ceil(this.totalApprenants / this.size)) {
        this.page = newPage;
        this.updateDisplayedApprenants(); // Mettre à jour les apprenants affichés
    }
}

  onCohorteChange(): void {
    if (this.selectedCohorte) {
      this.loadApprenants();
    }
  }

  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastInitial = nom ? nom.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  toggleSelectAll(event: any): void {
    this.apprenants.forEach((apprenant) => (apprenant.selected = event.target.checked));
    this.updateSelectedApprenants();
  }

  updateSelectedApprenants(): void {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  filterSelected() {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  getSelectedIds() {
    const ids = this.selectedApprenants.map((a) => a.id);
    console.log('Selected IDs:', ids);
  }

  bulkDelete(): void {
    if (this.selectedApprenants.length === 0) return;
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir supprimer ces apprenants ?',
      () => {
        this.selectedApprenants.forEach((apprenant) => {
          this.apprenantService.deleteApprenant(apprenant.id).subscribe(() => {
            this.showNotification(`Apprenant supprimé avec succès`);
            this.loadApprenants();
          });
        });
      }
    );
  }

  bulkBlock(): void {
    if (this.selectedApprenants.length === 0) return;
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir bloquer ces apprenants ?',
      () => {
        this.selectedApprenants.forEach((apprenant) => {
          this.apprenantService.blockApprenant(apprenant.id).subscribe(() => {
            this.showNotification(`Apprenant bloqué avec succès`);
            this.loadApprenants();
          });
        });
      }
    );
  }


        // Méthode pour confirmer le blocage ou le déblocage de l'apprenant
      // Méthode pour confirmer le blocage ou le déblocage de l'apprenant
      confirmBlockOrUnblockApprenant(apprenant: any): void {
        const message = apprenant.is_active 
          ? `Voulez-vous vraiment bloquer ${apprenant.prenom} ${apprenant.nom} ?` 
          : `Voulez-vous vraiment débloquer ${apprenant.prenom} ${apprenant.nom} ?`;

        // Appeler la fonction d'ouverture du modal avec la confirmation
        this.openConfirmationModal(
          message,
          () => this.blockOrUnblockApprenant(apprenant) // Action après confirmation
        );
      }


  
                    // Bloquer ou débloquer un apprenant en fonction de son état actuel
            blockOrUnblockApprenant(apprenant: any): void {
              const action = apprenant.is_active ? 'block' : 'unblock';

              if (action === 'block') {
                // L'apprenant est actif, on le bloque
                this.apprenantService.blockApprenant(apprenant.id).subscribe(
                  (response) => {
                    this.showNotification(`Apprenant ${apprenant.prenom} ${apprenant.nom} bloqué avec succès`);
                    apprenant.is_active = false; // Mise à jour de l'état local de l'apprenant
                    this.loadApprenants(); // Recharger les apprenants après l'action
                  },
                  (error) => {
                    this.showNotification('Erreur lors du blocage de l\'apprenant', true);
                  }
                );
              } else {
                // L'apprenant est bloqué, donc on le débloque
                this.apprenantService.unblockApprenant(apprenant.id).subscribe(
                  (response) => {
                    this.showNotification(`Apprenant ${apprenant.prenom} ${apprenant.nom} débloqué avec succès`);
                    apprenant.is_active = true; // Mise à jour de l'état local de l'apprenant
                    this.loadApprenants(); // Recharger les apprenants après l'action
                  },
                  (error) => {
                    this.showNotification('Erreur lors du déblocage de l\'apprenant', true);
                  }
                );
              }
            }


  
          // Débloquer plusieurs apprenants
        bulkUnblock(): void {
          if (this.selectedApprenants.length === 0) return; // Vérifier si des apprenants sont sélectionnés

          // Demander confirmation avant de débloquer
          this.openConfirmationModal(
            'Êtes-vous sûr de vouloir débloquer ces apprenants ?',
            () => {
              // Récupérer les IDs des apprenants sélectionnés
              const ids = this.selectedApprenants.map((apprenant) => apprenant.id);

              // Appeler le service pour débloquer les apprenants sélectionnés
              this.apprenantService.unblockMultipleApprenants(ids).subscribe(
                () => {
                  this.showNotification('Apprenants débloqués avec succès');
                  this.loadApprenants(); // Recharger la liste des apprenants après l'action
                },
                (error) => {
                  this.showNotification('Erreur lors du déblocage des apprenants', true);
                }
              );
            }
          );
        }

                      // Débloquer plusieurs apprenants
          unblockMultipleApprenants(ids: number[]): void {
            this.apprenantService.unblockMultipleApprenants(ids).subscribe(
              (response) => {
                console.log('Apprenants débloqués avec succès', response);
                this.showNotification('Apprenants débloqués avec succès');
                this.loadApprenants(); // Recharger les apprenants après l'action
              },
              (error) => {
                console.error('Erreur lors du déblocage des apprenants', error);
                this.showNotification('Erreur lors du déblocage des apprenants', true);
              }
            );
          }

   

  // Fermer le modal sans importer
  closeImportDialog() {
    this.isImporting = false;
    this.selectedFile = null; // Réinitialiser le fichier sélectionné
  }

  // Gérer la sélection du fichier
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

 // Ouvrir la boîte de dialogue d'importation CSV pour les apprenants
openApprenantCSVImportDialog(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv'; // Accepter uniquement les fichiers CSV

  input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
          this.importApprenantCSV(file);
      }
  };

  input.click(); // Ouvrir la boîte de dialogue pour sélectionner le fichier
}

// Importer le fichier CSV via le service apprenant
importApprenantCSV(file: File): void {
  this.apprenantService.importCSV(file).subscribe(
      (response) => {
          // Afficher le message de succès
          this.showNotification('L\'importation des apprenants a été réussie !');
          console.log('Fichier CSV importé avec succès:', response);
      },
      (error) => {
          // Afficher les erreurs
          this.showNotification('Erreur lors de l\'importation : ' + error.message);
          console.error('Erreur lors de l\'importation du fichier CSV:', error);
      }
  );
}

  editApprenant(apprenant: any): void {
    this.apprenant = { ...apprenant }; // Crée une copie des données de l'apprenant pour l'édition
    this.isEditing = true; // Affiche le formulaire d'édition
    this.errorMessages = []; // Réinitialise les messages d'erreur
  }

  validateField(field: any): void {
    if (field.invalid && field.touched) {
      if (field.errors?.required) {
        this.errorMessages.push(`${field.name} est requis.`);
      }
      if (field.errors?.pattern) {
        this.errorMessages.push(`${field.name} doit respecter le format requis.`);
      }
      if (field.errors?.email) {
        this.errorMessages.push(`L'email est invalide.`);
      }
    } else {
      // Filtre les messages d'erreur liés à ce champ
      this.errorMessages = this.errorMessages.filter(
        (message) => !message.includes(field.name)
      );
    }
  }

  isFormValid(): boolean {
    return Object.values(this.apprenant).every(value => typeof value === 'string' ? value.trim() !== '' : value);
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.apprenantService.updateApprenant(this.apprenant).subscribe(
        (data) => {
          this.showNotification('Apprenant mis à jour avec succès', false);
          this.closeEditModal();
        },
        (error) => {
          this.showNotification('Erreur lors de la mise à jour de l\'apprenant', true);
          console.error('Erreur lors de la mise à jour de l\'apprenant', error);
        }
      );
    }
  }



  // Fermer le modal
  closeEditModal(): void {
    this.isEditing = false;
  }



  viewApprenant(apprenant: any) {
    this.selectedApprenant = apprenant;
    this.showApprenantModal = true;
  }

  closeApprenantModal() {
    this.showApprenantModal = false;
    this.selectedApprenant = null;
  }
  // Method to show notification message
  showNotification(message: string, isError: boolean = false): void {
    this.notificationMessage = message;
    this.notificationClass = isError ? 'error' : 'success';

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
      this.notificationMessage = '';
    }, 5000);
  }

  // Modal logic
  openConfirmationModal(message: string, action: Function): void {
    this.confirmationMessage = message;
    this.actionToConfirm = action;
    this.showConfirmationModal = true;
  }

  confirmAction(): void {
    if (this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.closeConfirmationModal();
  }

  cancelAction(): void {
    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationMessage = '';
    this.actionToConfirm = null;
  }

 

  

  // Example of usage corrected: Delete an apprenant
  deleteApprenant(apprenant: Apprenant): void {
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir supprimer cet apprenant ?',
      () => {
        this.apprenantService.deleteApprenant(apprenant.id).subscribe((response) => {
          this.showNotification(`Apprenant supprimé avec succès`);
          this.loadApprenants(); // Reload apprenants after deletion
        });
      }
    );
  }

  
  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadApprenants();
    }
  }

  nextPage(): void {
    this.page++;
    this.loadApprenants();
  }

  onApprenantSelect(apprenant: Apprenant, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedApprenants.push(apprenant);
    } else {
      this.selectedApprenants = this.selectedApprenants.filter(e => e.id !== apprenant.id);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalApprenants / this.size);
  }
  Math = Math;
}