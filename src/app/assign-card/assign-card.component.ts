import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-card',
  templateUrl: './assign-card.component.html',
  styleUrls: ['./assign-card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [],
})
export class AssignCardComponent implements OnInit {
  utilisateursId: string = '';
  utilisateurs: any = {};
  cardId: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.utilisateursId = params.get('id') || '';
      if (this.utilisateursId) {
        this.loadEmployeeData();
      }
    });
  }

  loadEmployeeData(): void {
    this.authService.getUsers().subscribe(
      (users: any[]) => {
        this.utilisateurs = users.find((user) => user.id === this.utilisateursId);
        if (!this.utilisateurs) {
          console.error('Utilisateur introuvable avec l\'ID fourni.');
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  onAssignCard(): void {
    if (!this.cardId) {
      alert('Veuillez scanner ou saisir un Card ID.');
      return;
    }
    this.utilisateurs.cardID = this.cardId;
    console.log('Carte assignée avec Card ID:', this.cardId);
  }

  simulateCardIdFromArduino(): void {
    this.cardId = '1234567890';
    console.log('Card ID simulé:', this.cardId);
  }
}
