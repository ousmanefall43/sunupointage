import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


export interface Apprenant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  adresse?: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApprenantService {

  private baseUrl = 'http://localhost:8000/api/apprenant';
  private apiUrlCohortes = 'http://localhost:8000/api/cohortes';      // URL de l'API Laravel pour les cohortes


  constructor(private http: HttpClient) {}

  getCohortes(): Observable<any> {
    return this.http.get(`${this.apiUrlCohortes}/list`);
  }

 
  getApprenantsByCohorte(id: string ): Observable<Apprenant[]> {
    return this.http.get<{ apprenants: Apprenant[] }>(`${this.apiUrlCohortes}/${id}/apprenants`).pipe(
      map((response) => {
        if (response && response.apprenants) {
          return response.apprenants; // Retourne uniquement le tableau des apprenants
        } else {
          console.error('Format de réponse inattendu:', response);
          return []; // Retourne une liste vide si la structure est incorrecte
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des apprenants:', error);
        return of([]); // Retourne une liste vide en cas d'erreur
      })
    );
  }
  

// Supprimer un employé
deleteApprenant(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete/${id}`);
}

    // Bloquer un employé
    blockApprenant(id: number): Observable<any> {
      return this.http.post(`${this.baseUrl}/block/${id}`, {});
    }

    unblockApprenant(id: number): Observable<any> {
      return this.http.put(`${this.baseUrl}/unblock/${id}`, {});
    }
    
    // Débloquer plusieurs apprenants
    unblockMultipleApprenants(ids: number[]): Observable<any> {
      return this.http.put(`${this.baseUrl}/unblock`, { ids });
    }


  deleteApprenants(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/apprenant/bulk-delete`, { ids });
  }

  blockApprenants(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/apprenant/bulk-block`, { ids });
  }

 // Importer des apprenants via CSV
importCSV(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.baseUrl}/import`, formData);
}

    
  

  // Méthode pour récupérer les employés par département
  listerApprenantsParCohorte(cohorteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCohortes}/${cohorteId}/apprenant`);
  }

 // Méthode pour récupérer un apprenant par son ID
 getApprenantById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/show/${id}`);
}

// Mettre à jour un apprenant
updateApprenant(apprenant: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/update/${apprenant.id}`, apprenant);
}

}