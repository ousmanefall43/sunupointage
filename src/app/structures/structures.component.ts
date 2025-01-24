import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';  // Importer FormsModule ici
import { CommonModule } from '@angular/common';
import { StructureService } from '../structure.service';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';


interface Structure {
  name: string;
  nom: string;
  type: 'departement' | 'cohorte';
  responsable_departement: string;
  responsable_cohorte: string;
  nombre_personne: number;
  description: string;
  annee: number;
  heure_entree: number;
}
@Component({
  selector: 'app-structures',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],  // Assurez-vous que CommonModule est aussi importé si nécessaire
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css'],
})




export class StructuresComponent implements OnInit {



  isDepartementModalOpen: boolean = false;
  isCohorteModalOpen: boolean = false;
  
  successMessage: string | null = null;

  errorMessage: string | null = null;  // Variable pour stocker le message d'erreur

  currentForm: string | null = null;  // initialisation de currentForm
  currentEditForm: string | null = null; // Pour les modals de modification
  employesAssocies: any[] = [];
  apprenantsAssocies: any[] = [];

  employes: any[] = [];  // Assurez-vous que cette propriété est bien définie
 
  currentDepartement: any = {}; // Propriété pour les données du département
  currentCohorte: any = {}; // Propriété pour les données de la cohorte

    currentPage: string = 'departement';  // Page par défaut
    showSuccessModal: boolean = false;


    nameValid: boolean = false;
    nomValid: boolean = false;
    responsableValid: boolean = false;
    nombrePersonneValid: boolean = false;
    nombrePersonnesValid: boolean = false;
    descriptionValid: boolean = false;
    anneeValid: boolean = false;
    heureEntreeValid: boolean = false;
    heureSortieValid: boolean = false;
    dateDebutValid: boolean = false;
    dateFinValid: boolean = false;

    isSubmitted: boolean = false;


    showEmployesModal: boolean = false;


    apprenants: any[] = [];
    formData: any = {};  // Données du formulaire
    isEmployeeFormVisible: boolean = false;  // Visibilité du formulaire d'employé
    isApprenantFormVisible: boolean = false;  // Visibilité du formulaire d'apprenant
  




    // Méthode pour changer la page
   setPage(page: string) {
  this.currentPage = page;
  this.errorMessage = null;  // Réinitialiser l'erreur avant de faire la requête

  this.filterType = page; // Met à jour filterType pour refléter la page active
  this.loadData(); // Recharge les données selon le nouveau type
}

    // Méthode pour afficher le formulaire
    showForm(formType: string) {
      this.currentForm = formType;  // 'departement', 'cohorte', ou 'editDepartement'
    }
    
    
    
    
    showEditForm(type: string, item: any): void {
      if (type === 'departement') {
        this.currentDepartement = { ...item };
        this.currentEditForm = 'departement';
      } else if (type === 'cohorte') {
        this.currentCohorte = { ...item };
        this.currentEditForm = 'cohorte';
      }
    }
    
  
  newDepartement = {
    name: '',
    responsable_departement: '',
    nombre_personne: 0,
    description: '',
    annee: new Date().getFullYear(),
    heure_entree: '',
    heure_sortie: ''
  };
  
  newCohorte = {
    nom: '',
    responsable_cohorte: '',
    nombre_personnes: 0,
    description: '',
    date_debut: '',
    date_fin: '',
    heure_entree: '',
    heure_sortie: ''
  };


 // Fonction pour fermer le modal de cohorte


 closeCohorteForm() {
  this.newCohorte = {
    nom: '',
    responsable_cohorte: '',
    nombre_personnes: 0,
    description: '',
    date_debut: '',
    date_fin: '',
    heure_entree: '',
    heure_sortie: ''
  };
  this.currentForm = null; // Optionnel : pour fermer le modal
}

closeDepartementForm() {
  this.newDepartement = {
    name: '',
    responsable_departement: '',
    nombre_personne: 0,
    description: '',
    annee: new Date().getFullYear(),
    heure_entree: '',
    heure_sortie: ''
  };
  this.currentForm = null; // Optionnel : pour fermer le modal
  
}

successMessageVisible = false;


  departements: any[] = [];  // Liste des départements récupérés de l'API
  cohortes: any[] = [];  // Liste des cohortes récupérées de l'API
  filteredData: any[] = [];  // Liste filtrée qui contient soit des départements soit des cohortes
  filterType: string = 'departement'; // Par défaut, on affiche les départements
  searchQuery: string = ''; // La barre de recherche
  currentPages: number = 1;
  itemsPerPage: number = 6;
  selectAll: boolean = false; // Variable pour la case à cocher "tout sélectionner"
  selectedItems: any[] = [];  // Liste des éléments sélectionnés

  constructor(private structureService: StructureService, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.loadData(); // Charge les données dès le démarrage
  }

  // Méthode pour charger les départements ou cohortes en fonction du filtre
  filterData(): void {
    console.log('Filtre sélectionné:', this.filterType); // Affichez la valeur de filterType
    let dataToFilter = this.filterType === 'departement' ? this.departements : this.cohortes;
  
    // Appliquer le filtre de recherche
    this.filteredData = dataToFilter.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) // Rechercher par le nom
    );
  
    this.applyPagination(); // Appliquer la pagination après filtrage
    this.updateSelectedItems(); // Mettre à jour les éléments sélectionnés
  }
  

// Charger les départements ou les cohortes en fonction du filtre
loadData(): void {
  console.log('Filtre actuel:', this.filterType);  // Vérifier la valeur de filterType avant de charger les données

  if (this.filterType === 'departement') {
    this.structureService.getDepartements().subscribe(
      (data) => {
        console.log('Départements récupérés:', data);  // Vérifier que les départements sont bien récupérés
        this.departements = data;
        this.filteredData = [...this.departements]; // Initialiser les données filtrées pour départements
        this.filterData(); // Appliquer le filtrage
      },
      (error) => {
        console.error('Erreur lors de la récupération des départements', error);
      }
    );
  } else if (this.filterType === 'cohorte') {
    console.log('Filtre cohorte sélectionné, récupération des cohortes...'); // Log pour vérifier l'appel
    this.structureService.getCohortes().subscribe(
      (data) => {
        console.log('Cohortes récupérées:', data);  // Vérifier que les cohortes sont bien récupérées
        this.cohortes = data;
        this.filteredData = [...this.cohortes]; // Initialiser les données filtrées pour cohortes
        this.filterData(); // Appliquer le filtrage
      },
      (error) => {
        console.error('Erreur lors de la récupération des cohortes', error);
      }
    );
  }
}



  // Méthode pour ajouter un item (département ou cohorte)
  addItem(): void {


    this.notificationMessage = '';  // Réinitialiser le message de notification précédent
    this.isSubmitted = true;  // Marque le formulaire comme soumis
    const isDepartement = this.filterType === 'departement';


    const newItem = this.filterType === 'departement' ? {
      name: this.newDepartement.name,
      responsable_departement: this.newDepartement.responsable_departement,
      nombre_personne: this.newDepartement.nombre_personne,
      description: this.newDepartement.description,
      annee: this.newDepartement.annee,
      heure_entree: this.newDepartement.heure_entree,
      heure_sortie: this.newDepartement.heure_sortie
    } : {
      nom: this.newCohorte.nom,
      responsable_cohorte: this.newCohorte.responsable_cohorte,
      nombre_personnes: this.newCohorte.nombre_personnes,
      description: this.newCohorte.description,
      date_debut: this.newCohorte.date_debut,
      date_fin: this.newCohorte.date_fin,
      heure_entree: this.newCohorte.heure_entree,
      heure_sortie: this.newCohorte.heure_sortie
    };

    if (this.filterType === 'departement') {
      this.structureService.addDepartement(newItem).subscribe(
        (data) => {
          this.departements.push(data);
          this.filteredData.push(data);
          this.showNotification('Le département a été ajouté avec succès.');          this.resetForm(isDepartement);
          this.closeDepartementForm();

              },
        (error) => {
          console.error('Erreur lors de l\'ajout du département', error);
          if (error.status === 400 && error.error?.error) {
            this.errorMessage = error.error.error; // Capturez le message d'erreur
            
          }
        }
      );
    } else if (this.filterType === 'cohorte') {
      this.structureService.addCohorte(newItem).subscribe(
        (data) => {
          this.cohortes.push(data);
          this.filteredData.push(data);
          this.showNotification('La cohorte a été ajoutée avec succès.');
         this.resetForm(isDepartement);  
         this.closeCohorteForm();     },
        (error) => {
          console.error('Erreur lors de l\'ajout de la cohorte', error);
          if (error.status === 400 && error.error?.error) {
            this.errorMessage = error.error.error; // Capturez le message d'erreur

          }
        }
      );
    }
  }
        

  closeDepartementEditForm() {
    this.currentEditForm = ''; // Ferme le modal
    this.currentDepartement = {}; // Optionnel: réinitialiser les données du département
    this.cdr.detectChanges();
  }
  
  closeCohorteEditForm() {
    this.currentEditForm = ''; // Ferme le modal
    this.currentCohorte = {}; // Optionnel: réinitialiser les données de la cohorte
    this.cdr.detectChanges();
  }
      
    



 

  // Méthode pour afficher le formulaire de modification
  editItem(type: string, item: any) {
    if (!item) {
      console.error('Données invalides :', item);
      return;
    }
  
    console.log('Élément cliqué:', item);
  
    if (type === 'departement') {
      this.currentDepartement = { ...item };  // On copie les données du département sélectionné
      this.currentEditForm = 'departement';   // Ouvre le formulaire pour le département
    } else if (type === 'cohorte') {
      this.currentCohorte = { ...item };      // On copie les données de la cohorte sélectionnée
      this.currentEditForm = 'cohorte';      // Ouvre le formulaire pour la cohorte
    } else {
      console.error('Type inconnu:', type);
    }
  
    console.log('currentEditForm après modification:', this.currentEditForm);  // Debug
    this.cdr.detectChanges();
    }

  // Méthode pour mettre à jour un département
 

  updateDepartement(): void {
    // Vérification des champs obligatoires
    if (!this.currentDepartement.name || 
        !this.currentDepartement.responsable_departement || 
        !this.currentDepartement.description || 
        !this.currentDepartement.nombre_personne || 
        !this.currentDepartement.annee || 
        !this.currentDepartement.heure_entree || 
        !this.currentDepartement.heure_sortie) {
      return; // Empêche la soumission si des champs sont manquants
    }
  
    console.log('Données envoyées :', this.currentDepartement);
  
    this.structureService.updateDepartement(this.currentDepartement.id, this.currentDepartement).subscribe(
      (updatedDepartement) => {
        console.log('Département mis à jour :', updatedDepartement);
              // Mettre à jour localement la liste des départements
          const index = this.departements.findIndex(dep => dep.id === updatedDepartement.id);
          if (index !== -1) {
            this.departements[index] = { ...updatedDepartement };
          }
        
        // Fermer le formulaire
        this.closeDepartementEditForm();
        
             // Forcer la détection des changements
             this.cdr.markForCheck();
  
        // Afficher le message de succès après la fermeture du modal
        setTimeout(() => {
          this.showNotification("Les modifications ont été enregistrées avec succès.");
          console.log(this.successMessage);

       
  
          // Supprimer le message après 3 secondes
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        }, 500); // Attente pour s'assurer que le modal est fermé
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du département', error);
      }
    );
  }
  
  
  
  
  updateCohorte(): void {
    console.log('Méthode updateCohorte appelée');
  
    // Validation des champs
    if (!this.currentCohorte.nom || 
        !this.currentCohorte.responsable_cohorte || 
        !this.currentCohorte.description || 
        !this.currentCohorte.nombre_personnes || 
        !this.currentCohorte.date_debut || 
        !this.currentCohorte.date_fin || 
        !this.currentCohorte.heure_entree || 
        !this.currentCohorte.heure_sortie) {
      console.log('Des champs sont manquants');
      return; // Empêche la soumission si des champs sont manquants
    }
  
    // Envoi de la requête de mise à jour via le service
    this.structureService.updateCohorte(this.currentCohorte.id, this.currentCohorte).subscribe(
      (updatedCohorte) => {
        console.log('Cohorte mise à jour:', updatedCohorte);
        this.closeCohorteEditForm();
  
        // Mise à jour locale de currentCohorte
        this.currentCohorte = { ...this.currentCohorte, ...updatedCohorte };
  
        // Affichage du message de succès
        this.showNotification('La cohorte a été mise à jour avecsuccès.');

        setTimeout(() => this.successMessage = null, 3000);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la cohorte', error);
  
        // Affichage du message d'erreur
        this.errorMessage = "Une erreur est survenue lors de la mise à jour de la cohorte.";
        setTimeout(() => this.errorMessage = null, 3000);
      }
    );
  }
  
  

   
  
   
  
  // Exemple de fonction getEmployes
getEmployes(departementId: number): void {
  this.structureService.getEmployesByDepartement(departementId).subscribe(
    (response) => {
      this.employesAssocies = response.employes; // Assurez-vous que le retour est bien un tableau d'employés
    },
    (error) => {
      console.error('Erreur lors de la récupération des employés', error);
    }
  );
}


  // Méthode pour récupérer les apprenants associés à une cohorte
  getApprenantsAssocies(cohorteId: number): void {
    this.structureService.listerApprenantsParCohorte(cohorteId)
      .subscribe((data: { apprenants: any[] }) => {
        this.apprenantsAssocies = data.apprenants;  // Affecter la liste des apprenants à la variable
      }, (error) => {
        console.error('Erreur lors de la récupération des apprenants', error);
      });
  }


  closeDepartementModal() {
    this.isDepartementModalOpen = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }


  showConfirmationModal: boolean = false;
  itemToDelete: any = null;
  itemName: string = '';  // Nouvelle propriété pour le nom de l'élément à supprimer

  // Méthode pour afficher le modal de confirmation avant suppression
  confirmDelete(item: any) {
    this.itemToDelete = item;

    // Personnalisation du message de confirmation selon le type d'élément
    if (this.filterType === 'departement') {
      this.itemName = item.name; // Utiliser 'name' pour les départements
    } else if (this.filterType === 'cohorte') {
      this.itemName = item.nom; // Utiliser 'nom' pour les cohortes
    }

    // Affichage du modal de confirmation
    this.showConfirmationModal = true;
  }

  // Méthode pour annuler la suppression
  cancelDelete() {
    this.showConfirmationModal = false;
    this.itemToDelete = null;
    this.itemName = '';  // Réinitialiser le nom après l'annulation
  }

  // Méthode pour supprimer l'élément
  deleteItem() {
    if (this.itemToDelete) {
      const item = this.itemToDelete;
      if (this.filterType === 'departement') {
        this.structureService.deleteDepartement(item.id).subscribe(
          () => {
            this.departements = this.departements.filter(d => d.id !== item.id);
            this.filteredData = this.filteredData.filter(d => d.id !== item.id);
            this.showNotification('Département supprimé');
          },
          (error) => {
            console.error('Erreur lors de la suppression du département', error);
          }
        );
      } else if (this.filterType === 'cohorte') {
        this.structureService.deleteCohorte(item.id).subscribe(
          () => {
            this.cohortes = this.cohortes.filter(c => c.id !== item.id);
            this.filteredData = this.filteredData.filter(c => c.id !== item.id);
            this.showNotification('Cohorte supprimée');
          },
          (error) => {
            console.error('Erreur lors de la suppression de la cohorte', error);
          }
        );
      }
      this.showConfirmationModal = false;
      this.itemToDelete = null;
      this.itemName = '';  // Réinitialiser le nom après suppression
    }
  }



  // Méthode pour sélectionner/désélectionner tous les éléments
  selectAllItems() {
    this.filteredData.forEach(item => item.selected = this.selectAll);
    this.updateSelectedItems();
  }

  // Met à jour les éléments sélectionnés
  updateSelectedItems() {
    this.selectedItems = this.filteredData.filter(item => item.selected);
    this.selectAll = this.filteredData.length === this.selectedItems.length;
  }

  // Pagination - Appliquer la pagination sur la liste filtrée
  applyPagination() {
    const startIndex = (this.currentPages - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredData = this.filteredData.slice(startIndex, endIndex);
  }

  // Pagination - Page précédente
  prevPage() {
    if (this.currentPages > 1) {
      this.currentPages--;
      this.filterData();
    }
  }

  // Pagination - Page suivante
  nextPage() {
    this.currentPages++;
    this.filterData();
  }

   
  showConfirmationModals: boolean = false;  // Contrôle de l'affichage du modal

  // Méthode pour afficher le modal de confirmation avant suppression
  confirmDeleteSelected() {
   this.showConfirmationModals = true;  // Afficher le modal de confirmation
 }

  // Méthode pour annuler la suppression
  cancelDeletes() {
   this.showConfirmationModals = false;  // Fermer le modal sans suppression
 }

 
 notificationMessage: string = ''; // Message de notification
 notificationClass: string = '';  // Classe de notification ('error' ou 'success')

 // Méthode pour afficher le message de notification
 showNotification(message: string, isError: boolean = false) {
   this.notificationMessage = message;
   this.notificationClass = isError ? 'error' : 'success';



   // Afficher la notification
   const notificationElement = document.getElementById('notification');
   if (notificationElement) {
     notificationElement.classList.add('show');  // Afficher la notification

     // Cacher la notification après 3 secondes
     setTimeout(() => {
       notificationElement.classList.remove('show');
     }, 3000);
   }
 }

 // Méthode pour supprimer les éléments sélectionnés
 deleteSelected() {
   const selectedIds = this.selectedItems.map(item => item.id);

   if (this.filterType === 'departement') {
     this.structureService.bulkDeleteDepartements(selectedIds).subscribe(
       () => {
         this.departements = this.departements.filter(d => !selectedIds.includes(d.id));
         this.filteredData = this.filteredData.filter(d => !selectedIds.includes(d.id));
         this.selectedItems = []; // Réinitialiser les éléments sélectionnés

         // Afficher un message de succès
         this.showNotification(`${selectedIds.length} départements ont été supprimés avec succès.`, false);
       },
       (error) => {
         console.error('Erreur lors de la suppression en masse', error);
         this.showNotification("Une erreur est survenue lors de la suppression des départements.", true);
       }
     );
   } 
   else if (this.filterType === 'cohorte') {
     this.structureService.bulkDeleteCohortes(selectedIds).subscribe(
       () => {
         this.cohortes = this.cohortes.filter(c => !selectedIds.includes(c.id));
         this.filteredData = this.filteredData.filter(c => !selectedIds.includes(c.id));
         this.selectedItems = []; // Réinitialiser les éléments sélectionnés

         // Afficher un message de succès
         this.showNotification(`${selectedIds.length} cohortes ont été supprimées avec succès.`, false);
       },
       (error) => {
         console.error('Erreur lors de la suppression en masse', error);
         this.showNotification("Une erreur est survenue lors de la suppression des cohortes.", true);
       }
     );
   }

   // Fermer le modal après la suppression
   this.showConfirmationModals = false;
 }



// Méthode pour réinitialiser le formulaire
resetForm(isDepartement: boolean): void {
  if (isDepartement) {
    this.newDepartement = {
      name: '',
      responsable_departement: '',
      nombre_personne: 0,
      description: '',
      annee: new Date().getFullYear(),
      heure_entree: '',
      heure_sortie: '',
    };
  } else {
    this.newCohorte = {
      nom: '',
      responsable_cohorte: '',
      nombre_personnes: 0,
      description: '',
      date_debut: '',
      date_fin: '',
      heure_entree: '',
      heure_sortie: '',
    };
  }
  this.isSubmitted = false; // Réinitialise le statut du formulaire

}

  // Supprimer le message de succès
  clearSuccessMessage(): void {
    this.successMessage = null;
  }


  // Propriétés pour la visibilité du mot de passe
  showPassword: boolean = false;
  employe: any = {}; // Instead of employes: any[] = [];
  apprenant: any = {}; // Instead of employes: any[] = [];

  // Méthode pour afficher/masquer le mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showEmployeeForm: boolean = false;
  showApprenantForm: boolean = false;

 

  
  // Variables pour stocker l'ID de la cohorte ou du département déjà sélectionné
  selectedCohorteId: number | null = null;  // Cohorte déjà définie
  selectedDepartementId: number | null = null;  // Département déjà défini

 


// Méthode pour afficher le formulaire et pré-remplir les informations
selectCohorte(cohorteId: number): void {
  this.selectedCohorteId = cohorteId;
  console.log('Cohorte sélectionnée:', this.selectedCohorteId);
  // Afficher le formulaire d'ajout d'un apprenant
  this.showFormForItem('cohorte');
}

selectDepartement(departementId: number): void {
  this.selectedDepartementId = departementId;
  console.log('Département sélectionné:', this.selectedDepartementId);
  // Afficher le formulaire d'ajout d'un employé
  this.showFormForItem('departement');
}

showFormForItem(choix: string): void {
  console.log('Type de filtre sélectionné:', choix);

  // Initialisation des objets pour apprenant et employé
  if (choix === 'departement') {
    this.employe = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      photo: null,
      matricule: '',
      is_active: true,
      role: '',
      departement_id: this.selectedDepartementId,  // ID du département déjà défini
      fonction: '',
      card_id: ''
    };
  } else if (choix === 'cohorte') {
    this.apprenant = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      photo: null,
      matricule: '',
      is_active: true,

      role: '',
      cohorte_id: this.selectedCohorteId,  // ID de la cohorte déjà définie
      card_id: ''
    };
  }

  // Afficher le formulaire correspondant
  if (choix === 'departement') {
    this.showEmployeeForm = true;
    this.showApprenantForm = false;
  } else if (choix === 'cohorte') {
    this.showApprenantForm = true;
    this.showEmployeeForm = false;
  }
}

onSubmitForm(): void {
  const formData = new FormData();

  if (this.showApprenantForm) {
    // Vérification pour l'apprenant
    Object.keys(this.apprenant).forEach(key => {
      if (this.apprenant[key] !== null) {
        formData.append(key, this.apprenant[key]);
      }
    });

    formData.append('is_active', 'true');


    this.structureService.addApprenant(formData).subscribe(
      response => {
        this.showNotification('Apprenant ajouté avec succès:');
        this.closeModal();
      },
      error => console.error('Erreur lors de l\'ajout de l\'apprenant:', error)
    );
  } else if (this.showEmployeeForm) {
    // Vérification pour l'employé
    console.log('Département ID:', this.employe.departement_id);  // Vérification de la valeur du département ID

    if (!this.employe.departement_id) {
      console.error('Le champ departement_id est requis mais est vide.');
      return;
    }

    // Préparation des données pour un employé
    Object.keys(this.employe).forEach(key => {
      if (this.employe[key] !== null) {
        formData.append(key, this.employe[key]);
      }
    });

    formData.append('is_active', 'true');

    this.structureService.addEmploye(formData).subscribe(
      response => {
        this.showNotification('Employé ajouté avec succès:');
        this.closeModal();
      },
      error => console.error('Erreur lors de l\'ajout de l\'employé:', error)
    );
  }
}

// Fermer le modal
closeModal(): void {
  this.showEmployeeForm = false;
  this.showApprenantForm = false;
}



// Validation de champ
validateField(field: any): void {
  if (!field.valid) {
    console.error('Le champ n\'est pas valide');
  }
}




   
  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Get the first selected file
    if (file) {
      this.employe.photo = file; // Assign the file to your object
    }
  }


    // Variable pour savoir si le mot de passe est visible

    // Fonction pour basculer la visibilité du mot de passe
    togglePassword(): void {
      this.showPassword = !this.showPassword;
    }
}