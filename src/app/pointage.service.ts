import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PointageService {
  private apiUrl = 'http://localhost:8000/api/pointages'; // URL de l'API backend

  constructor(private http: HttpClient) {}

  // Récupérer les pointages
  getPointages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  // Mettre à jour un pointage
// Mettre à jour un pointage
updatePointage(pointage: any): Observable<any> {
  console.log('Pointage envoyé:', pointage);

  if (!pointage._id) {
    console.error('Erreur: Le pointage ne contient pas de champ "_id".', pointage);
    return throwError(() => new Error('Le pointage doit contenir un champ "_id" pour être mis à jour.'));
  }

  // Construire l'URL de la requête avec l'ID
  const url = `${this.apiUrl}/${pointage._id}`; // L'URL sera par exemple : http://localhost:8000/api/pointages/12345

  const headers = new HttpHeaders({
    'Content-Type': 'application/json', // Format des données
  });

  return this.http.put<any>(url, pointage, { headers }).pipe(
    catchError(this.handleError)
  );
}

  // Transformer les données pour les adapter au graphique
  getPointagesForChart(): Observable<any> {
    return this.getPointages().pipe(
      map((pointages) => {
        const groupedData: { [key: string]: { apprenants: number; employes: number } } = {};

        // Grouper les données par date
        pointages.forEach((pointage) => {
          const date = pointage.date;
          if (!groupedData[date]) {
            groupedData[date] = { apprenants: 0, employes: 0 };
          }

          // Exemple : vous pourriez différencier apprenants et employés ici
          groupedData[date].apprenants += 1; // Incrémenter pour chaque pointage
          groupedData[date].employes += 1; // Incrémenter pour chaque pointage
        });

        // Retourner un tableau pour le graphique
        return {
          labels: Object.keys(groupedData),
          apprenants: Object.values(groupedData).map((data) => data.apprenants),
          employes: Object.values(groupedData).map((data) => data.employes),
        };
      })
    );
  }

  // Fonction pour gérer les erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur: ${error.status}, Message: ${error.message}`;
    }

    // Afficher l'erreur dans la console et retourner un observable d'erreur
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
