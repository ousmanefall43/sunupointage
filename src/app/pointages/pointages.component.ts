import { Component, OnInit } from '@angular/core';
import { PointageService } from '../pointage.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importer FormsModule
import { SidebarComponent } from '../sidebar/sidebar.component'; // Chemin correct vers le composant Sidebar

@Component({
  selector: 'app-pointages',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SidebarComponent], // Ajouter FormsModule
  templateUrl: './pointages.component.html',
  styleUrls: ['./pointages.component.css']
})
export class PointagesComponent implements OnInit {
  pointages: any[] = []; // Stocke les données des pointages
  selectedPointage: any = null; // Stocke le pointage sélectionné pour modification
  isModalOpen: boolean = false; // Contrôle l'affichage du modal
  isSaving: boolean = false; // Contrôle l'état de l'enregistrement
  isSuccessModalOpen: boolean = false; // Contrôle l'affichage du modal de succès


  constructor(private pointageService: PointageService) {}

  ngOnInit(): void {
    this.loadPointages();
  }

  /**
   * Charge les données des pointages depuis le service.
   */
  loadPointages(): void {
    this.pointageService.getPointages().subscribe(
      (data) => {
        this.pointages = data.map((pointage) => {
          const firstTime = pointage.firstTime ? new Date(`${pointage.date}T${pointage.firstTime}`) : null;

          if (!firstTime) {
            pointage.status = 'Absent';
          } else if (firstTime.getHours() > 8) {
            pointage.status = 'Retard';
          } else {
            pointage.status = 'Présent';
          }

          return pointage;
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération des pointages:', error);
      }
    );
  }

  /**
   * Ouvre le modal et charge les données du pointage sélectionné.
   */
  openModal(pointage: any): void {
    this.selectedPointage = { ...pointage }; // Dupliquez le pointage pour ne pas modifier directement les données d'origine
    this.isModalOpen = true;
  }

  /**
   * Ferme le modal.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Envoie les modifications au backend.
   */
  onEnregistrer(): void {
    this.isSaving = true; // Active l'indicateur de sauvegarde
  
    this.pointageService.updatePointage(this.selectedPointage).subscribe(
      (updatedPointage) => {
        const index = this.pointages.findIndex(p => p.id === updatedPointage.id); // Assurez-vous que l'id correspond au modèle de données
        if (index !== -1) {
          this.pointages[index] = updatedPointage; // Mettre à jour le pointage modifié dans le tableau
        }
        this.closeModal(); // Ferme le modal d'édition
        this.isSaving = false; // Désactive l'indicateur de sauvegarde
        
        // Afficher le modal de succès
        this.isSuccessModalOpen = true;
        console.log('Succès : Modal ouvert'); // Vérification
        
      },
      (error) => {
        this.isSaving = false; // Désactive l'indicateur de sauvegarde en cas d'erreur
        console.error('Erreur lors de la mise à jour du pointage:', error);
      }
    );
  }
  
  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }
  

  /**
   * Fonction pour gérer le bouton d'enregistrement avec un délai simulé pour l'exemple.
   */
  submitModification() {
    this.isSaving = true;
    console.log('Bouton Enregistrer cliqué');
    
    // Simuler une action (comme un appel à l'API)
    setTimeout(() => {
      this.isSaving = false;
      alert('Données enregistrées avec succès !');
    }, 2000);
  }
}
