import { CommonModule } from '@angular/common'; // Pour *ngIf, ngClass, etc.
import { FormsModule } from '@angular/forms'; // Pour [(ngModel)]
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Component } from '@angular/core';
import { HttpClient, provideHttpClient, withFetch ,HttpClientModule} from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule], // Ajoutez cette ligne
 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword: boolean = false;
  user = { email: '', password: '' }; // Modèle utilisateur
  isLoading: boolean = false; // Indicateur de chargement
  errorMessage: string | null = null; // Message d'erreur

  constructor(private http: HttpClient) {}

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      return;
    }

    this.errorMessage = null; // Réinitialiser les messages d'erreur
    this.isLoading = true; // Activer l'indicateur de chargement

    // Appel API simulé (remplacez par votre backend)
    this.http.post('http://localhost:8000/api/login', this.user).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Connexion réussie :', response);
        // Redirigez l'utilisateur ou gérez les actions après connexion
      },
      error: (error) => {
        this.errorMessage = "Une erreur s'est produite lors de la connexion.";
        this.isLoading = false;
      }
    });
  }
}